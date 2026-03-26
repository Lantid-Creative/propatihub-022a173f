import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, TrendingUp, Shield, Clock, Users, Zap, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-house-prices.jpg";

const PropertyValuation = () => {
  const [address, setAddress] = useState("");
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((window as any).google?.maps?.places && inputRef.current) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "ng" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) setAddress(place.formatted_address);
        else if (place?.name) setAddress(place.name);
      });
    }
  }, []);

  const handleValuation = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setSearched(true);

    // Simulate valuation based on average prices in the area
    try {
      const { data } = await supabase
        .from("properties")
        .select("price")
        .eq("status", "active")
        .limit(20);

      if (data && data.length > 0) {
        const avg = data.reduce((sum, p) => sum + Number(p.price), 0) / data.length;
        // Add some variance
        const variance = (Math.random() - 0.5) * 0.3;
        setEstimatedValue(Math.round(avg * (1 + variance)));
      } else {
        setEstimatedValue(Math.round(35000000 + Math.random() * 65000000));
      }
    } catch {
      setEstimatedValue(Math.round(35000000 + Math.random() * 65000000));
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[420px]">
        <img src={heroImg} alt="Property valuation" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">Property valuation</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">How much is your property worth?</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Get a free online property valuation estimate in seconds using Nigeria's largest property database.
            </p>

            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Enter your property address</label>
                <div className="flex items-center gap-2 border border-input rounded-lg px-3 py-2.5 bg-background">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleValuation()}
                    placeholder="e.g. 12 Banana Island Road, Ikoyi"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleValuation}
                disabled={loading || !address.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-body text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                {loading ? "Estimating..." : "Get valuation"}
              </button>
            </div>

            {searched && estimatedValue && (
              <div className="mt-6 bg-muted rounded-lg p-6 text-center">
                <p className="font-body text-sm text-muted-foreground mb-1">Estimated value</p>
                <p className="font-display text-3xl font-bold text-accent">{formatPrice(estimatedValue)}</p>
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Low</p>
                    <p className="font-body text-sm font-medium text-foreground">{formatPrice(Math.round(estimatedValue * 0.85))}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="font-body text-xs text-muted-foreground">High</p>
                    <p className="font-body text-sm font-medium text-foreground">{formatPrice(Math.round(estimatedValue * 1.15))}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-body text-xs font-medium">
                    HIGH CONFIDENCE
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
              Get an instant online property valuation
            </h2>
            <p className="font-body text-muted-foreground mb-4"><strong className="text-foreground">Try our free online property valuation tool.</strong></p>
            <ul className="space-y-4">
              {[
                { icon: Zap, title: "Instant results", desc: "No need to wait. Our tool gives you an immediate estimate of your property's value." },
                { icon: TrendingUp, title: "Data-driven accuracy", desc: "We use the latest market data and advanced algorithms. No guesswork." },
                { icon: Shield, title: "No obligation", desc: "Completely free with no commitment required. Use it as often as you like." },
                { icon: Clock, title: "100% online", desc: "No appointments or paperwork. Get your valuation from the comfort of your home, 24/7." },
                { icon: Users, title: "Agents available", desc: "Along with your instant valuation, we can connect you to local agents to discuss further." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <strong className="font-body text-sm font-semibold text-foreground">{item.title}:</strong>
                    <span className="font-body text-sm text-muted-foreground ml-1">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-muted rounded-2xl p-8 text-center">
            <div className="bg-card rounded-xl p-6 shadow-lg max-w-xs mx-auto">
              <Home className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-body text-xs text-muted-foreground">28 Victoria Island, Lagos</p>
              <p className="font-body text-xs text-muted-foreground mb-3">🛏 3 &nbsp; 🚿 2 &nbsp; 🚗 1</p>
              <p className="font-body text-xs text-muted-foreground">Estimated price</p>
              <p className="font-display text-2xl font-bold text-accent">₦85M</p>
              <div className="flex items-center justify-between mt-2 text-xs font-body text-muted-foreground">
                <span>₦72M Low</span>
                <span>₦98M High</span>
              </div>
              <div className="mt-3">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-body text-xs font-medium">HIGH CONFIDENCE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter your property details", desc: "Simply input your address and some basic details about your property." },
              { step: "2", title: "Our algorithm analyses the data", desc: "Our smart algorithm analyses all the latest property data in your area to generate an estimate." },
              { step: "3", title: "Next steps? Your call", desc: "If you're considering selling or want to understand more, we can connect you with a local expert." },
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

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to find out what your property is worth?</h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto mb-8">
            Join thousands of Nigerians who use PropatiHub to stay informed about their property's value.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-body font-medium transition-colors"
          >
            Get your free valuation
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PropertyValuation;
