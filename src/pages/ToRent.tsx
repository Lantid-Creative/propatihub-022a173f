import PageSEO from "@/components/PageSEO";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Home, Shield, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-to-rent.jpg";

const maxPriceOptions = [
  { label: "No max", value: "" },
  { label: "₦50,000/yr", value: "50000" },
  { label: "₦100,000/yr", value: "100000" },
  { label: "₦200,000/yr", value: "200000" },
  { label: "₦500,000/yr", value: "500000" },
  { label: "₦1,000,000/yr", value: "1000000" },
  { label: "₦2,000,000/yr", value: "2000000" },
  { label: "₦3,000,000/yr", value: "3000000" },
  { label: "₦5,000,000/yr", value: "5000000" },
  { label: "₦10,000,000/yr", value: "10000000" },
  { label: "₦20,000,000/yr", value: "20000000" },
  { label: "₦50,000,000/yr", value: "50000000" },
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

const propertyTypes = [
  { label: "Show all", value: "" },
  { label: "House", value: "house" },
  { label: "Apartment", value: "apartment" },
  { label: "Commercial", value: "commercial" },
  { label: "Short Let", value: "short_let" },
];

const exploreLinks = [
  { label: "Commercial to rent", href: "/properties?type=rent&property=commercial" },
  { label: "Find letting agents", href: "/find-agents" },
  { label: "Short Let properties", href: "/properties?type=short_let" },
  { label: "Student accommodation", href: "/properties?type=rent&beds=1" },
];

const ToRent = () => {
  const [query, setQuery] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
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
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("type", "rent");
    if (minBeds) params.set("beds", minBeds);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (propertyType) params.set("property", propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO title="Properties to Rent in Nigeria" description="Search apartments, houses, and short-let properties to rent across Nigeria. Secure your tenancy with caution fee escrow." canonical="/to-rent" />
      <section className="relative min-h-[540px]">
        <img src={heroImg} alt="Properties to rent in Nigeria" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="hero-gradient absolute inset-0" />
        <Navbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 font-body text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">PropatiHub</Link>
            <span>/</span>
            <span className="text-primary-foreground">To rent</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-card rounded-xl p-6 md:p-8 max-w-lg shadow-2xl">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Properties to rent</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Search apartments and houses to rent across Nigeria.
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
                    placeholder="e.g. Abuja, Wuse, Maitama"
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

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Property type</label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map((pt) => (
                    <div key={pt.label} className="flex items-center gap-2">
                      <Checkbox
                        id={`pt-${pt.value}`}
                        checked={propertyType === pt.value}
                        onCheckedChange={() => setPropertyType(pt.value)}
                      />
                      <label htmlFor={`pt-${pt.value}`} className="font-body text-sm text-foreground cursor-pointer">
                        {pt.label}
                      </label>
                    </div>
                  ))}
                </div>
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
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Explore more properties to rent</h2>
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

      {/* Benefits */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Find your next home to rent with PropatiHub
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Find your perfect rental</h3>
              <p className="font-body text-sm text-muted-foreground">
                Use advanced filters for tailored results — from budget to location to property type.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Reassurance when you need it</h3>
              <p className="font-body text-sm text-muted-foreground">
                All properties are verified. Know your rights and what to expect with our expert rental guides.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Stay informed</h3>
              <p className="font-body text-sm text-muted-foreground">
                Get property alerts so you're first to know when new rentals matching your criteria are listed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ToRent;
