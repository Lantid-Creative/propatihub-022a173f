import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenancy_id, contract_type } = await req.json();

    // Fetch tenancy details with property and tenant/landlord info
    const { data: tenancy, error: tenancyError } = await supabase
      .from("tenancies")
      .select("*, properties(*)")
      .eq("id", tenancy_id)
      .single();

    if (tenancyError || !tenancy) {
      return new Response(JSON.stringify({ error: "Tenancy not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch profiles
    const { data: landlordProfile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", tenancy.landlord_id)
      .single();

    const { data: tenantProfile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", tenancy.tenant_id)
      .single();

    const property = tenancy.properties;
    const contractTypeLabel = contract_type === "tenancy_agreement"
      ? "Tenancy Agreement"
      : contract_type === "lease_renewal"
      ? "Lease Renewal Agreement"
      : "Property Management Agreement";

    const systemPrompt = `You are a Nigerian property law expert. Generate a professional, legally sound ${contractTypeLabel} contract for a Nigerian property transaction. Use formal legal language. Include all standard clauses required under Nigerian tenancy law. Format with clear section headings and numbered clauses. Use markdown formatting.`;

    const userPrompt = `Generate a ${contractTypeLabel} with the following details:

Property: ${property.title}
Address: ${property.address || "N/A"}, ${property.city}, ${property.state}
Property Type: ${property.property_type}

Landlord: ${landlordProfile?.full_name || "Landlord"}
Tenant: ${tenantProfile?.full_name || "Tenant"}

Monthly Rent: ₦${Number(tenancy.monthly_rent).toLocaleString()}
Lease Start: ${tenancy.lease_start}
Lease End: ${tenancy.lease_end || "Open-ended"}
Caution Fee: ₦${Number(property.caution_fee || 0).toLocaleString()}

Include sections for: Parties, Property Description, Term, Rent & Payment, Security Deposit/Caution Fee, Obligations of Landlord, Obligations of Tenant, Maintenance, Termination, Dispute Resolution, and Signatures.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    // Save to database using service role
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: contract, error: insertError } = await serviceClient
      .from("legal_contracts")
      .insert({
        tenancy_id,
        property_id: tenancy.property_id,
        landlord_id: tenancy.landlord_id,
        tenant_id: tenancy.tenant_id,
        contract_type,
        title: `${contractTypeLabel} - ${property.title}`,
        content,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ contract }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-contract error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
