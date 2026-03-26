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

    for (const escrow of expiredEscrows || []) {
      // Auto-release the escrow
      const { error: updateError } = await supabase
        .from("caution_fee_escrow")
        .update({
          escrow_status: "released",
          release_approved_at: new Date().toISOString(),
          release_reason: "Auto-released after 72-hour timeout",
        })
        .eq("id", escrow.id);

      if (!updateError) {
        released++;
        console.log(`Auto-released escrow ${escrow.id} for tenant ${escrow.tenant_id}`);
      } else {
        console.error(`Failed to release escrow ${escrow.id}:`, updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: (expiredEscrows || []).length,
        released,
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
