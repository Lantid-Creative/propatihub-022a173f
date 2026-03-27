import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageSEO from "@/components/PageSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, MapPin, BedDouble, Bath, Search, Building2 } from "lucide-react";

const nigerianStates = [
  "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Enugu", "Anambra", "Delta",
  "Kaduna", "Ogun", "Edo", "Ondo", "Kwara", "Osun", "Ekiti", "Imo", "Abia",
  "Cross River", "Akwa Ibom", "Bayelsa", "Benue", "Borno", "Gombe", "Jigawa",
  "Kebbi", "Kogi", "Nassarawa", "Niger", "Plateau", "Sokoto", "Taraba", "Yobe",
  "Zamfara", "Adamawa", "Bauchi", "Ebonyi",
];

const NYSCHousing = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .eq("nysc_friendly", true)
        .order("created_at", { ascending: false });

      if (stateFilter !== "all") {
        query = query.eq("state", stateFilter);
      }

      const { data } = await query;
      setProperties(data || []);
      setLoading(false);
    };
    fetch();
  }, [stateFilter]);

  const fmt = (p: number) => `₦${p.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="NYSC Housing — Affordable Accommodation for Corps Members"
        description="Find verified, affordable housing near NYSC secretariats and CDS venues across all 36 states + FCT. NYSC-friendly properties vetted for corps members."
        canonical="/nysc-housing"
      />

      {/* Hero */}
      <section className="relative bg-primary pt-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60 mb-6">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">NYSC Housing</span>
          </div>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground">
                  NYSC Housing
                </h1>
                <p className="font-body text-primary-foreground/70 text-sm">
                  Affordable, verified accommodation for corps members
                </p>
              </div>
            </div>
            <p className="font-body text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Serving in a new state? Find safe, affordable housing close to your NYSC secretariat,
              CDS venue, or place of primary assignment. All properties are verified and marked as
              NYSC-friendly by agents and landlords.
            </p>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="bg-card text-foreground">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {nigerianStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge className="bg-accent text-accent-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-accent/5 border-b border-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "🏠", title: "Affordable Rent", desc: "Properties marked for corps members are typically budget-friendly with flexible payment terms." },
              { icon: "📍", title: "Strategic Locations", desc: "Close to NYSC secretariats, CDS venues, and places of primary assignment." },
              { icon: "🤝", title: "Shared Options", desc: "Many listings offer shared apartments so you can split costs with fellow corpers." },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                <span className="text-xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{tip.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">No NYSC properties yet</h2>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto mb-4">
              {stateFilter !== "all"
                ? `No NYSC-friendly properties found in ${stateFilter}. Try another state.`
                : "Properties will appear here once agents and landlords mark their listings as NYSC-friendly."}
            </p>
            <Link to="/to-rent" className="text-accent font-body text-sm hover:underline">
              Browse all rental properties →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <Link to={`/property/${p.id}`} key={p.id} className="group">
                <Card className="overflow-hidden border-border hover:border-accent/40 transition-colors h-full">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {p.images?.length > 0 ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-primary text-primary-foreground text-[10px]">
                        <GraduationCap className="w-3 h-3 mr-0.5" /> NYSC
                      </Badge>
                      <Badge className="bg-accent text-accent-foreground text-[10px] capitalize">{p.listing_type === "rent" ? "For Rent" : p.listing_type}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-display text-lg font-bold text-accent">{fmt(p.price)}</p>
                    <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                      {p.title}
                    </h3>
                    <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {p.city}, {p.state}
                    </p>
                    {(p.bedrooms || p.bathrooms) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                        {p.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {p.bedrooms} bed</span>}
                        {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms} bath</span>}
                      </div>
                    )}
                    {p.nysc_details && (
                      <p className="font-body text-xs text-primary/80 bg-primary/5 rounded px-2 py-1 line-clamp-2">
                        🎓 {p.nysc_details}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default NYSCHousing;
