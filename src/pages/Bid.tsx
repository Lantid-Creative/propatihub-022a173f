import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Gavel, TrendingUp, Shield, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-for-sale.jpg";

const GOOGLE_MAPS_API_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

const maxPriceOptions = [
  { label: "No max", value: "" },
  { label: "₦5,000,000", value: "5000000" },
  { label: "₦10,000,000", value: "10000000" },
  { label: "₦20,000,000", value: "20000000" },
  { label: "₦50,000,000", value: "50000000" },
  { label: "₦100,000,000", value: "100000000" },
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
  { label: "5+", value: "5" },
];

const Bid = () => {
  const [query, setQuery] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if ((window as any).google?.maps?.places && mounted && inputRef.current) {
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
    params.set("type", "bid");
    if (minBeds) params.set("beds", minBeds);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[500px]">
        <img src={heroImg} alt="Properties for bidding in Nigeria" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">Bid on properties</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="w-6 h-6 text-accent" />
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Bid on properties</h1>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Find properties listed for bidding and place your best offer. All bids are transparent and in real-time.
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
                    placeholder="e.g. Lekki, Victoria Island, Banana Island"
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

              <button
                onClick={handleSearch}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-lg font-body text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Find bidding properties
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How Bidding Works */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            How bidding works on PropatiHub
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Find a property",
                desc: "Browse properties listed for bidding. All listings are verified and complete with full property details.",
              },
              {
                step: "2",
                icon: Gavel,
                title: "Place your bid",
                desc: "Enter your best offer. All bids are visible in real-time so you can see where you stand against other bidders.",
              },
              {
                step: "3",
                icon: Shield,
                title: "Secure the deal",
                desc: "The property owner or agent reviews bids and can accept the best offer. All transactions happen within PropatiHub.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Why bid on PropatiHub?
            </h2>
            <ul className="space-y-4">
              {[
                { icon: TrendingUp, title: "Transparent pricing", desc: "All bids are visible in real-time. No hidden offers or backroom deals." },
                { icon: Shield, title: "Verified properties", desc: "Every bidding property has complete details and has been verified by our team." },
                { icon: Users, title: "Open to everyone", desc: "Whether you're a buyer, agent, agency, or homeowner — everyone can bid." },
                { icon: Gavel, title: "Fair competition", desc: "The highest bid wins. Simple, fair, and transparent for all parties." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <strong className="font-body text-sm font-semibold text-foreground">{item.title}:</strong>
                    <span className="font-body text-sm text-muted-foreground ml-1">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-2xl p-8 text-center shadow-lg">
            <Gavel className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Ready to start bidding?</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Search for properties above or browse all available bidding listings.
            </p>
            <button
              onClick={() => navigate("/properties?type=bid")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-body font-medium transition-colors"
            >
              Browse all bidding properties
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bid;
