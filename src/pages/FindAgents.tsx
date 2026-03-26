import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Users, BarChart3, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-find-agents.jpg";

const agentTypes = [
  { label: "Sales and Lettings", value: "all" },
  { label: "Sales", value: "sales" },
  { label: "Lettings", value: "lettings" },
  { label: "Commercial", value: "commercial" },
];

const FindAgents = () => {
  const [query, setQuery] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("all");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: topAgencies } = useQuery({
    queryKey: ["top-agencies"],
    queryFn: async () => {
      const { data } = await supabase.from("agencies").select("*").eq("verified", true).limit(6);
      return data || [];
    },
  });

  useEffect(() => {
    if ((window as any).google?.maps?.places && inputRef.current) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ["(regions)"],
        componentRestrictions: { country: "ng" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) setQuery(place.formatted_address);
        else if (place?.name) setQuery(place.name);
      });
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (agentName) params.set("name", agentName);
    if (agentType !== "all") params.set("type", agentType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[560px]">
        <img src={heroImg} alt="Find estate agents" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">Find agents</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Find and compare estate agents</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Discover top local estate agents across Nigeria and choose the right one to sell or let your property with confidence.
            </p>

            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Search area</label>
                <div className="flex items-center gap-2 border border-input rounded-lg px-3 py-2.5 bg-background">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. Lekki, Abuja"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Agent name (optional)</label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Agent name"
                  className="bg-background"
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Agent type</label>
                <Select value={agentType} onValueChange={setAgentType}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-body text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter your location",
                desc: "Enter your area to see the best estate agents near you.",
              },
              {
                step: "2",
                title: "Tell us what you need",
                desc: "Whether you're selling, buying, or letting — we'll connect you with the best agents for your needs.",
              },
              {
                step: "3",
                title: "Compare top agents",
                desc: "Compare agents side by side, see their listings and track record, then get in touch directly.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-xl font-bold text-accent">{item.step}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why use PropatiHub */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Why use PropatiHub to find an agent?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: "Compare agents side by side", desc: "See how agents perform in your area with real data on listings, sales, and response times." },
              { icon: CheckCircle2, title: "Verified professionals", desc: "Every agent on PropatiHub is verified, licensed, and trusted by our community." },
              { icon: Star, title: "Read genuine reviews", desc: "Hear from real people who've bought, sold, or rented through each agent." },
              { icon: MessageSquare, title: "Get in touch easily", desc: "Contact agents directly through PropatiHub — no middlemen, no delays." },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl p-6 border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Agencies */}
      {topAgencies && topAgencies.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Top agencies on PropatiHub</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {topAgencies.map((agency) => (
                <div key={agency.id} className="bg-card rounded-xl p-6 border border-border card-hover text-center">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={agency.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" loading="lazy" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <h3 className="font-display text-base font-bold text-foreground">{agency.name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{agency.city}, {agency.state}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default FindAgents;
