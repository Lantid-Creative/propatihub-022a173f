import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!PAYSTACK_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Paystack not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { escrow_id } = await req.json();

    if (!escrow_id) {
      return new Response(JSON.stringify({ error: "escrow_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the escrow record
    const { data: escrow, error: escrowError } = await supabase
      .from("caution_fee_escrow")
      .select("*")
      .eq("id", escrow_id)
      .single();

    if (escrowError || !escrow) {
      return new Response(JSON.stringify({ error: "Escrow not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only the landlord or admin can disburse
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (escrow.landlord_id !== userId && !isAdmin) {
      return new Response(JSON.stringify({ error: "Only the landlord or admin can disburse" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Must be in release_requested or held state
    if (!["release_requested", "held"].includes(escrow.escrow_status)) {
      return new Response(JSON.stringify({ error: `Cannot disburse escrow with status: ${escrow.escrow_status}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Must be paid
    if (escrow.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Escrow payment not completed yet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get tenant's bank details
    const { data: bankDetails, error: bankError } = await supabase
      .from("tenant_bank_details")
      .select("*")
      .eq("user_id", escrow.tenant_id)
      .single();

    if (bankError || !bankDetails) {
      return new Response(JSON.stringify({ error: "Tenant has not added bank details for payout. Ask the tenant to add their bank details in their Tenant Portal." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Create or reuse Paystack transfer recipient
    let recipientCode = bankDetails.paystack_recipient_code;

    if (!recipientCode) {
      const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name: bankDetails.account_name || "Tenant",
          account_number: bankDetails.account_number,
          bank_code: bankDetails.bank_code,
          currency: "NGN",
        }),
      });

      const recipientData = await recipientRes.json();
      if (!recipientData.status) {
        console.error("Paystack recipient error:", recipientData);
        return new Response(JSON.stringify({ error: `Failed to create transfer recipient: ${recipientData.message}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      recipientCode = recipientData.data.recipient_code;

      // Save the recipient code for future use
      await supabase
        .from("tenant_bank_details")
        .update({
          paystack_recipient_code: recipientCode,
          account_name: recipientData.data.details?.account_name || bankDetails.account_name,
          is_verified: true,
        })
        .eq("id", bankDetails.id);
    }

    // Step 2: Initiate the transfer
    const transferRef = `PH_ESCROW_DISBURSE_${escrow.id}_${Date.now()}`;
    const amountInKobo = escrow.amount * 100;

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reason: `Caution fee refund for escrow ${escrow.id}`,
        reference: transferRef,
      }),
    });

    const transferData = await transferRes.json();
    console.log("Paystack transfer response:", JSON.stringify(transferData));

    if (!transferData.status) {
      console.error("Paystack transfer error:", transferData);
      return new Response(JSON.stringify({ error: `Transfer failed: ${transferData.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: Update escrow status to released
    const { error: updateError } = await supabase
      .from("caution_fee_escrow")
      .update({
        escrow_status: "released",
        release_approved_at: new Date().toISOString(),
        release_reason: `Disbursed via Paystack transfer. Ref: ${transferRef}`,
      })
      .eq("id", escrow_id);

    if (updateError) {
      console.error("Escrow update error:", updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      transfer_reference: transferRef,
      transfer_status: transferData.data?.status,
      amount: escrow.amount,
      recipient: bankDetails.account_name || bankDetails.account_number,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
