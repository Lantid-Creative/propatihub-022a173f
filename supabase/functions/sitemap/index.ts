import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://propatihub.lovable.app";

const staticPages = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/for-sale", changefreq: "daily", priority: "0.9" },
  { loc: "/to-rent", changefreq: "daily", priority: "0.9" },
  { loc: "/properties", changefreq: "daily", priority: "0.9" },
  { loc: "/bid", changefreq: "daily", priority: "0.7" },
  { loc: "/nysc-housing", changefreq: "daily", priority: "0.8" },
  { loc: "/find-agents", changefreq: "weekly", priority: "0.8" },
  { loc: "/house-prices", changefreq: "weekly", priority: "0.8" },
  { loc: "/property-valuation", changefreq: "weekly", priority: "0.8" },
  { loc: "/mortgage-calculator", changefreq: "monthly", priority: "0.7" },
  { loc: "/buying-guide", changefreq: "monthly", priority: "0.7" },
  { loc: "/renting-guide", changefreq: "monthly", priority: "0.7" },
  { loc: "/blog", changefreq: "weekly", priority: "0.7" },
  { loc: "/about", changefreq: "monthly", priority: "0.6" },
  { loc: "/contact", changefreq: "monthly", priority: "0.6" },
  { loc: "/careers", changefreq: "monthly", priority: "0.5" },
  { loc: "/press", changefreq: "monthly", priority: "0.5" },
  { loc: "/advertise", changefreq: "monthly", priority: "0.5" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active properties (id and updated_at only for performance)
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const escapeXml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(BASE_URL + page.loc)}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic property pages
    for (const prop of properties || []) {
      const lastmod = prop.updated_at ? new Date(prop.updated_at).toISOString().split("T")[0] : "";
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${BASE_URL}/property/${prop.id}`)}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    return new Response(`<error>${err.message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
