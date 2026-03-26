import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Extract API key from header or query param
    const apiKey = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key");

    if (!apiKey) {
      return jsonResponse({
        error: "API key required",
        message: "Provide your API key via 'x-api-key' header or 'api_key' query parameter.",
      }, 401);
    }

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single();

    if (keyError || !keyData) {
      return jsonResponse({ error: "Invalid or inactive API key" }, 401);
    }

    // Update last used
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyData.id);

    // Check user role (must be agent or agency)
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", keyData.user_id);

    const userRoles = (roles || []).map((r: any) => r.role);
    if (!userRoles.includes("agent") && !userRoles.includes("agency") && !userRoles.includes("admin")) {
      return jsonResponse({ error: "API access is only available for agents and agencies" }, 403);
    }

    // Parse URL for endpoint routing
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // The path after /property-api/
    const endpoint = pathParts.slice(pathParts.indexOf("property-api") + 1).join("/");

    // Get query params
    const lga = url.searchParams.get("lga");
    const state = url.searchParams.get("state");
    const listing_type = url.searchParams.get("listing_type");
    const property_type = url.searchParams.get("property_type");
    const min_price = url.searchParams.get("min_price");
    const max_price = url.searchParams.get("max_price");
    const bedrooms = url.searchParams.get("bedrooms");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // Route: GET /properties
    if (!endpoint || endpoint === "properties") {
      if (!lga || !state) {
        return jsonResponse({
          error: "Missing required parameters",
          message: "Both 'lga' and 'state' query parameters are required.",
          example: "?lga=Ikeja&state=Lagos",
        }, 400);
      }

      // Check subscription for this LGA
      const { data: sub } = await supabase
        .from("api_subscriptions")
        .select("*")
        .eq("user_id", keyData.user_id)
        .eq("lga", lga)
        .eq("state", state)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!sub) {
        return jsonResponse({
          error: "No active subscription",
          message: `You need an active subscription for ${lga}, ${state} to access this data. Subscribe at ₦10,000/month per LGA.`,
          subscribe_url: "/api-access",
        }, 403);
      }

      // Build query
      let query = supabase
        .from("properties")
        .select("id, title, description, price, property_type, listing_type, status, bedrooms, bathrooms, area_sqm, address, city, state, features, images, furnishing, condition, year_built, parking_spaces, service_charge, caution_fee, latitude, longitude, created_at, updated_at", { count: "exact" })
        .eq("status", "active")
        .ilike("city", `%${lga}%`)
        .ilike("state", `%${state}%`);

      if (listing_type) query = query.eq("listing_type", listing_type);
      if (property_type) query = query.eq("property_type", property_type);
      if (min_price) query = query.gte("price", parseInt(min_price));
      if (max_price) query = query.lte("price", parseInt(max_price));
      if (bedrooms) query = query.eq("bedrooms", parseInt(bedrooms));

      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

      const { data: properties, error: propError, count } = await query;

      if (propError) {
        return jsonResponse({ error: "Failed to fetch properties", details: propError.message }, 500);
      }

      return jsonResponse({
        success: true,
        data: properties || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
        subscription: {
          lga: sub.lga,
          state: sub.state,
          expires_at: sub.expires_at,
        },
      });
    }

    // Route: GET /properties/:id
    if (endpoint.startsWith("properties/")) {
      const propertyId = endpoint.replace("properties/", "");

      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .eq("status", "active")
        .single();

      if (propError || !property) {
        return jsonResponse({ error: "Property not found" }, 404);
      }

      // Check subscription for property's LGA
      const { data: sub } = await supabase
        .from("api_subscriptions")
        .select("*")
        .eq("user_id", keyData.user_id)
        .ilike("lga", `%${property.city}%`)
        .ilike("state", `%${property.state}%`)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!sub) {
        return jsonResponse({
          error: "No active subscription",
          message: `You need a subscription for ${property.city}, ${property.state} to view this property.`,
        }, 403);
      }

      return jsonResponse({ success: true, data: property });
    }

    // Route: GET /subscriptions - view active subscriptions
    if (endpoint === "subscriptions") {
      const { data: subs } = await supabase
        .from("api_subscriptions")
        .select("lga, state, status, starts_at, expires_at, amount")
        .eq("user_id", keyData.user_id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString());

      return jsonResponse({ success: true, data: subs || [] });
    }

    // Route: GET /lgas - list available LGAs
    if (endpoint === "lgas") {
      const { data: cities } = await supabase
        .from("properties")
        .select("city, state")
        .eq("status", "active");

      // Deduplicate
      const lgaSet = new Map<string, { lga: string; state: string; count: number }>();
      for (const c of cities || []) {
        const key = `${c.city}|${c.state}`;
        if (lgaSet.has(key)) {
          lgaSet.get(key)!.count++;
        } else {
          lgaSet.set(key, { lga: c.city, state: c.state, count: 1 });
        }
      }

      return jsonResponse({
        success: true,
        data: Array.from(lgaSet.values()).sort((a, b) => b.count - a.count),
        price_per_lga: 10000,
        currency: "NGN",
      });
    }

    return jsonResponse({ error: "Unknown endpoint", available: ["/properties", "/properties/:id", "/subscriptions", "/lgas"] }, 404);
  } catch (err) {
    console.error("API Error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
