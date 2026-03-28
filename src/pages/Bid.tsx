import PageSEO from "@/components/PageSEO";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, Gavel, TrendingUp, Shield, Users, Clock, Banknote, ShieldCheck, Crown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BidSubscriptionTiers from "@/components/BidSubscriptionTiers";
import LiveBidProperties from "@/components/LiveBidProperties";
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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minBeds, setMinBeds] = useState(searchParams.get("beds") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
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
      <PageSEO title="Bid on Properties in Nigeria" description="Place bids on verified properties across Nigeria. Transparent, real-time bidding with fair competition for buyers, agents, and agencies." canonical="/bid" />
      {/* Hero */}
      <section className="relative min-h-[500px]">
        <img src={heroImg} alt="Properties for bidding in Nigeria" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />

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

      {/* Live Bidding Properties */}
      <LiveBidProperties searchQuery={query} minBeds={minBeds} maxPrice={maxPrice} />

      {/* How Bidding Works - Updated */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            How bidding works on PropatiHub
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: ShieldCheck,
                title: "Verify your identity",
                desc: "Complete KYC with your BVN or NIN. This ensures only verified, serious buyers participate.",
              },
              {
                step: "2",
                icon: Crown,
                title: "Choose a plan",
                desc: "Select a subscription tier that matches your investment level for access to higher-value properties.",
              },
              {
                step: "3",
                icon: Banknote,
                title: "Place deposit & bid",
                desc: "Pay a refundable deposit (5% of property value) to bid. Deposits are returned if you don't win.",
              },
              {
                step: "4",
                icon: Gavel,
                title: "Win & complete",
                desc: "Highest bid wins when the auction timer ends. Winners have 7–14 days to complete payment.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 relative">
                  <item.icon className="w-6 h-6 text-accent" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bidding Conditions */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Bidding Conditions & Rules
          </h2>
          <p className="font-body text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Fair, transparent, and legally compliant property auctions.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "KYC & Financial Verification",
                desc: "All bidders must verify identity with BVN or NIN. Proof of funds required for high-value bids above ₦50M.",
              },
              {
                icon: Banknote,
                title: "Refundable Bid Deposit",
                desc: "5% deposit required before bidding. Fully refunded if you don't win. Forfeited if winner defaults on payment.",
              },
              {
                icon: Clock,
                title: "Time-Limited Auctions",
                desc: "24–72 hour bidding windows. Auctions auto-extend by 5 minutes if bids come in the final minutes.",
              },
              {
                icon: Shield,
                title: "Reserve Price Protection",
                desc: "Sellers set a minimum acceptable price. No property sells below the reserve — protecting both parties.",
              },
              {
                icon: TrendingUp,
                title: "Winner Payment Deadline",
                desc: "Winners have 7–14 days to complete full payment. Failure forfeits the deposit and the next highest bidder wins.",
              },
              {
                icon: Users,
                title: "Premium Early Access",
                desc: "Pro and Enterprise subscribers get listings before public users, plus an early bidding window advantage.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl p-6 border border-border">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <BidSubscriptionTiers />

      {/* CTA */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-2xl p-8 text-center shadow-lg max-w-xl mx-auto">
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

    </div>
  );
};

export default Bid;
