import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (req.method === "POST" && action === "initialize") {
      // Initialize a Paystack transaction
      const { email, amount, tenancy_id, property_id, tenant_id, landlord_id, payment_type, metadata } = await req.json();

      // Verify auth
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reference = `PH_${payment_type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack uses kobo
          reference,
          callback_url: metadata?.callback_url || `${url.origin}/payment/callback`,
          metadata: {
            tenancy_id,
            property_id,
            tenant_id,
            landlord_id,
            payment_type,
            ...metadata,
          },
        }),
      });

      const paystackData = await paystackRes.json();

      if (!paystackData.status) {
        return new Response(JSON.stringify({ error: paystackData.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "verify") {
      const { reference } = await req.json();

      // Verify auth
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });

      const paystackData = await paystackRes.json();

      if (!paystackData.status || paystackData.data.status !== "success") {
        return new Response(JSON.stringify({ error: "Payment not verified", details: paystackData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const meta = paystackData.data.metadata;
      const amountPaid = paystackData.data.amount / 100;

      if (meta.payment_type === "caution_fee") {
        // Update escrow record
        await supabase
          .from("caution_fee_escrow")
          .update({
            payment_status: "paid",
            paystack_reference: reference,
            paystack_authorization_code: paystackData.data.authorization?.authorization_code,
          })
          .eq("tenancy_id", meta.tenancy_id)
          .eq("tenant_id", meta.tenant_id)
          .eq("payment_status", "pending");
      } else if (meta.payment_type === "rent") {
        // Update rent payment
        await supabase
          .from("rent_payments")
          .update({
            status: "paid",
            paid_date: new Date().toISOString().split("T")[0],
            paystack_reference: reference,
          })
          .eq("id", meta.rent_payment_id)
          .eq("tenant_id", meta.tenant_id);
      } else if (meta.payment_type === "bid_subscription") {
        // Create or update bid subscription
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase.from("bid_subscriptions").insert({
          user_id: meta.user_id,
          tier: meta.tier,
          max_property_value: meta.max_property_value,
          max_active_bids: meta.max_active_bids,
          early_access: meta.early_access,
          amount: amountPaid,
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          paystack_reference: reference,
          status: "active",
        });
      } else if (meta.payment_type === "api_subscription") {
        // Create or renew API subscription for a state/LGA
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Deactivate existing subscription for same state/lga
        await supabase
          .from("api_subscriptions")
          .update({ status: "expired" })
          .eq("user_id", meta.user_id)
          .eq("state", meta.state)
          .eq("lga", meta.lga)
          .eq("status", "active");

        await supabase.from("api_subscriptions").insert({
          user_id: meta.user_id,
          state: meta.state,
          lga: meta.lga,
          amount: amountPaid,
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          paystack_reference: reference,
          status: "active",
        });
      }

      return new Response(JSON.stringify({
        success: true,
        amount: amountPaid,
        payment_type: meta.payment_type,
        tier: meta.tier || null,
        state: meta.state || null,
        lga: meta.lga || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "webhook") {
      // Paystack webhook verification
      const body = await req.text();
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(PAYSTACK_SECRET_KEY!),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"],
      );
      const hash = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));

      // Not implementing full webhook here — primary flow uses verify endpoint
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
