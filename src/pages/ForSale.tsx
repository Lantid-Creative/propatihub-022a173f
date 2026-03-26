import PageSEO from "@/components/PageSEO";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Home, Building2, TrendingUp, Calculator, FileText, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-for-sale.jpg";

const GOOGLE_MAPS_API_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

const maxPriceOptions = [
  { label: "No max", value: "" },
  { label: "₦5,000,000", value: "5000000" },
  { label: "₦10,000,000", value: "10000000" },
  { label: "₦15,000,000", value: "15000000" },
  { label: "₦20,000,000", value: "20000000" },
  { label: "₦30,000,000", value: "30000000" },
  { label: "₦50,000,000", value: "50000000" },
  { label: "₦75,000,000", value: "75000000" },
  { label: "₦100,000,000", value: "100000000" },
  { label: "₦150,000,000", value: "150000000" },
  { label: "₦200,000,000", value: "200000000" },
  { label: "₦500,000,000", value: "500000000" },
  { label: "₦1,000,000,000", value: "1000000000" },
];

const minBedOptions = [
  { label: "No min", value: "" },
  { label: "Studio", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6+", value: "6" },
];

const exploreLinks = [
  { label: "New Developments", href: "/properties?type=sale&property=house" },
  { label: "Land for Sale", href: "/properties?type=land" },
  { label: "Commercial Property", href: "/properties?property=commercial" },
  { label: "Short Let Properties", href: "/properties?type=short_let" },
  { label: "Find Estate Agents", href: "/find-agents" },
];

const tools = [
  {
    icon: Calculator,
    title: "Find out what you can afford",
    desc: "Calculate your mortgage affordability and see homes that fit your budget.",
    link: "/mortgage-calculator",
    cta: "Affordability calculator",
  },
  {
    icon: TrendingUp,
    title: "Check property prices",
    desc: "See what properties have sold for in any area across Nigeria.",
    link: "/house-prices",
    cta: "Check house prices",
  },
  {
    icon: Users,
    title: "Find the right agent",
    desc: "Compare top local agents and choose the best one to help you buy.",
    link: "/find-agents",
    cta: "Find agents",
  },
];

const ForSale = () => {
  const [query, setQuery] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [newBuildOnly, setNewBuildOnly] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if ((window as any).google?.maps?.places) {
        if (!mounted || !inputRef.current) return;
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
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("type", "sale");
    if (minBeds) params.set("beds", minBeds);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO title="Property for Sale in Nigeria" description="Find houses, apartments, land, and commercial properties for sale across Nigeria. Verified listings from trusted agents." canonical="/for-sale" ogImage="https://propatihub.lovable.app/og-for-sale.png" />
      <section className="relative min-h-[500px]">
        <img src={heroImg} alt="Property for sale in Nigeria" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        {/* Breadcrumb */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">For sale</span>
          </div>
        </div>

        {/* Search Card */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Property for sale</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Search houses, apartments and land for sale in Nigeria — find your dream home today.
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
                    placeholder="e.g. Lekki, Victoria Island"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Min beds</label>
                  <Select value={minBeds} onValueChange={setMinBeds}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="No min" /></SelectTrigger>
                    <SelectContent>
                      {minBedOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value || "none"}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Max price</label>
                  <Select value={maxPrice} onValueChange={setMaxPrice}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="No max" /></SelectTrigger>
                    <SelectContent>
                      {maxPriceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value || "none"}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="new-build"
                  checked={newBuildOnly}
                  onCheckedChange={(v) => setNewBuildOnly(v as boolean)}
                />
                <label htmlFor="new-build" className="font-body text-sm text-foreground cursor-pointer">
                  Show new-build homes only
                </label>
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

      {/* Explore more */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Explore more properties for sale</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {exploreLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-6 py-3 border border-border rounded-full font-body text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Work out what properties you can afford to buy
          </h2>
          <p className="font-body text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Our range of tools can help you make confident, informed decisions about your home.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link key={tool.title} to={tool.link} className="bg-card rounded-xl p-6 card-hover border border-border group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">{tool.desc}</p>
                <span className="font-body text-sm font-medium text-primary group-hover:underline">{tool.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How to Buy */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Find your next home to buy with PropatiHub
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Find your perfect home</h3>
              <p className="font-body text-sm text-muted-foreground">
                Use our advanced filters to search by location, budget, bedrooms, and property type to find exactly what you're looking for.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Verified listings only</h3>
              <p className="font-body text-sm text-muted-foreground">
                Every property on PropatiHub is verified by our team, so you can browse with confidence knowing each listing is genuine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Connect with trusted agents</h3>
              <p className="font-body text-sm text-muted-foreground">
                Get in touch with verified estate agents who can help you through every step of the buying process.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForSale;
