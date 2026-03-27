import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find escrows where release was requested > 72 hours ago and not yet actioned
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const { data: expiredEscrows, error: fetchError } = await supabase
      .from("caution_fee_escrow")
      .select("*")
      .eq("escrow_status", "release_requested")
      .lt("release_requested_at", cutoff);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let released = 0;
    let failed = 0;

    for (const escrow of expiredEscrows || []) {
      // Try to disburse via Paystack if possible
      let transferSuccess = false;
      let transferRef = "";

      if (PAYSTACK_SECRET_KEY && escrow.payment_status === "paid") {
        // Get tenant bank details
        const { data: bankDetails } = await supabase
          .from("tenant_bank_details")
          .select("*")
          .eq("user_id", escrow.tenant_id)
          .single();

        if (bankDetails) {
          try {
            // Create recipient if needed
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
              if (recipientData.status) {
                recipientCode = recipientData.data.recipient_code;
                await supabase
                  .from("tenant_bank_details")
                  .update({
                    paystack_recipient_code: recipientCode,
                    account_name: recipientData.data.details?.account_name || bankDetails.account_name,
                    is_verified: true,
                  })
                  .eq("id", bankDetails.id);
              }
            }

            if (recipientCode) {
              transferRef = `PH_AUTO_RELEASE_${escrow.id}_${Date.now()}`;
              const transferRes = await fetch("https://api.paystack.co/transfer", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  source: "balance",
                  amount: escrow.amount * 100,
                  recipient: recipientCode,
                  reason: `Auto-released caution fee refund for escrow ${escrow.id}`,
                  reference: transferRef,
                }),
              });

              const transferData = await transferRes.json();
              if (transferData.status) {
                transferSuccess = true;
              } else {
                console.error(`Transfer failed for escrow ${escrow.id}:`, transferData.message);
              }
            }
          } catch (transferErr) {
            console.error(`Transfer error for escrow ${escrow.id}:`, transferErr);
          }
        } else {
          console.log(`No bank details found for tenant ${escrow.tenant_id}, releasing escrow without transfer`);
        }
      }

      // Update escrow status regardless
      const { error: updateError } = await supabase
        .from("caution_fee_escrow")
        .update({
          escrow_status: "released",
          release_approved_at: new Date().toISOString(),
          release_reason: transferSuccess
            ? `Auto-released after 72-hour timeout. Paystack transfer ref: ${transferRef}`
            : "Auto-released after 72-hour timeout (manual transfer may be needed)",
        })
        .eq("id", escrow.id);

      if (!updateError) {
        released++;
        console.log(`Auto-released escrow ${escrow.id} for tenant ${escrow.tenant_id}, transfer: ${transferSuccess}`);
      } else {
        failed++;
        console.error(`Failed to release escrow ${escrow.id}:`, updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: (expiredEscrows || []).length,
        released,
        failed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
