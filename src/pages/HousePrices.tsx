import PageSEO from "@/components/PageSEO";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, BarChart3, Home, Calculator, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-house-prices.jpg";

const nigerianStates = [
  "Lagos", "Abuja", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu", "Anambra",
  "Delta", "Ogun", "Edo", "Cross River", "Bayelsa", "Ekiti", "Kwara", "Osun",
];

const HousePrices = () => {
  const [searchTab, setSearchTab] = useState("area");
  const [areaQuery, setAreaQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const navigate = useNavigate();

  const { data: priceStats } = useQuery({
    queryKey: ["price-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("city, state, price, property_type")
        .eq("status", "active")
        .limit(500);
      
      if (!data || data.length === 0) return null;

      const byState: Record<string, { total: number; count: number }> = {};
      data.forEach((p) => {
        if (!byState[p.state]) byState[p.state] = { total: 0, count: 0 };
        byState[p.state].total += Number(p.price);
        byState[p.state].count += 1;
      });

      const stateAverages = Object.entries(byState)
        .map(([state, { total, count }]) => ({ state, avgPrice: Math.round(total / count), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return { stateAverages, totalProperties: data.length };
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTab === "area" && areaQuery) {
      params.set("q", areaQuery);
    } else if (searchTab === "state" && selectedState) {
      params.set("q", selectedState);
    }
    navigate(`/properties?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `₦${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO title="House Prices in Nigeria" description="Research property prices across Nigeria. Compare house prices by state, city, and property type to make informed decisions." canonical="/house-prices" />
      <section className="relative min-h-[480px]">
        <img src={heroImg} alt="Research house prices" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">House prices</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Research property prices</h1>

            <Tabs value={searchTab} onValueChange={setSearchTab}>
              <TabsList className="mb-4 bg-muted">
                <TabsTrigger value="area" className="font-body text-sm">Area search</TabsTrigger>
                <TabsTrigger value="state" className="font-body text-sm">By state</TabsTrigger>
              </TabsList>

              <TabsContent value="area" className="space-y-4">
                <p className="font-body text-sm text-muted-foreground">
                  See property prices and trends in any area across Nigeria.
                </p>
                <div className="flex items-center gap-2 border border-input rounded-lg px-3 py-2.5 bg-background">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={areaQuery}
                    onChange={(e) => setAreaQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. Lekki, Victoria Island"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-body text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search area
                </button>
              </TabsContent>

              <TabsContent value="state" className="space-y-4">
                <p className="font-body text-sm text-muted-foreground">
                  Browse property prices by state.
                </p>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select a state" /></SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-body text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  View prices
                </button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Everything there is to know about Nigerian property
          </h2>
          <p className="font-body text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            If you want to know the value of your property or theirs, just ask PropatiHub.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "1. Search prices by area",
                desc: "Get property price data for every city, state, and neighbourhood across Nigeria.",
              },
              {
                icon: TrendingUp,
                title: "2. See price trends",
                desc: "Find out how prices have changed over time and what's happening in your local market.",
              },
              {
                icon: Calculator,
                title: "3. Make informed decisions",
                desc: "Use our data to understand what properties are worth before you buy, sell, or rent.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Average prices by state */}
      {priceStats?.stateAverages && priceStats.stateAverages.length > 0 && (
        <section className="py-16 px-6 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Average property prices by state
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {priceStats.stateAverages.map((s) => (
                <Link
                  key={s.state}
                  to={`/properties?q=${s.state}`}
                  className="bg-card rounded-xl p-5 border border-border card-hover"
                >
                  <h3 className="font-display text-base font-bold text-foreground">{s.state}</h3>
                  <p className="font-display text-lg font-bold text-accent mt-1">{formatPrice(s.avgPrice)}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{s.count} properties</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Valuation CTA */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
                Want to know your property's value?
              </h2>
              <p className="font-body text-primary-foreground/70 max-w-md">
                Get a free instant property valuation based on recent market data and comparable sales in your area.
              </p>
            </div>
            <Link
              to="/property-valuation"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-body font-medium whitespace-nowrap transition-colors"
            >
              Get instant valuation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HousePrices;
