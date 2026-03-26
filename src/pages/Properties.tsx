import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Maximize, Heart, Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const nigerianStates = ["All States", "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Enugu", "Anambra", "Delta", "Kaduna", "Ogun", "Edo", "Ondo", "Kwara", "Osun", "Ekiti"];

const listingTypeLabels: Record<string, string> = {
  sale: "For Sale",
  rent: "For Rent",
  short_let: "Short Let",
  land: "Land",
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    listing_type: searchParams.get("type") || "all",
    property_type: searchParams.get("property") || "all",
    state: searchParams.get("state") || "All States",
    min_price: searchParams.get("min") || "",
    max_price: searchParams.get("max") || "",
    bedrooms: searchParams.get("beds") || "any",
  });

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase
      .from("properties")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (filters.listing_type !== "all") {
      query = query.eq("listing_type", filters.listing_type as "sale" | "rent" | "short_let" | "land");
    }
    if (filters.property_type !== "all") {
      query = query.eq("property_type", filters.property_type as "house" | "apartment" | "land" | "commercial" | "short_let");
    }
    if (filters.state !== "All States") {
      query = query.eq("state", filters.state);
    }
    if (filters.min_price) {
      query = query.gte("price", parseInt(filters.min_price));
    }
    if (filters.max_price) {
      query = query.lte("price", parseInt(filters.max_price));
    }
    if (filters.bedrooms !== "any") {
      query = query.gte("bedrooms", parseInt(filters.bedrooms));
    }
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,city.ilike.%${filters.query}%,address.ilike.%${filters.query}%`);
    }

    const { data } = await query;
    setProperties(data || []);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("property_id").eq("user_id", user.id);
    setFavorites((data || []).map((f) => f.property_id));
  };

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.listing_type !== "all") params.set("type", filters.listing_type);
    if (filters.property_type !== "all") params.set("property", filters.property_type);
    if (filters.state !== "All States") params.set("state", filters.state);
    if (filters.min_price) params.set("min", filters.min_price);
    if (filters.max_price) params.set("max", filters.max_price);
    if (filters.bedrooms !== "any") params.set("beds", filters.bedrooms);
    setSearchParams(params);
    fetchProperties();
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favourites.", variant: "destructive" });
      return;
    }
    if (favorites.includes(propertyId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
      toast({ title: "Removed from favourites" });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
      setFavorites((prev) => [...prev, propertyId]);
      toast({ title: "Added to favourites" });
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const clearFilters = () => {
    setFilters({ query: "", listing_type: "all", property_type: "all", state: "All States", min_price: "", max_price: "", bedrooms: "any" });
    setSearchParams({});
    setTimeout(fetchProperties, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary">
        <div className="relative z-50">
          <nav className="px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link to="/">
                <img src="/src/assets/logo-dark.png" alt="PropatiHub" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/properties" className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm font-medium">All Properties</Link>
                <Link to="/auth" className="border border-primary-foreground/30 text-primary-foreground px-5 py-2 rounded-lg font-body text-sm font-medium hover:bg-primary-foreground/10">
                  {user ? "Dashboard" : "Sign in"}
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="px-6 pb-8 pt-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
              Find Properties
            </h1>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by location, title..."
                  className="pl-11 h-12 bg-card border-0 text-foreground"
                />
              </div>
              <Button onClick={handleSearch} className="h-12 px-6">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 bg-card border-0 text-foreground">
                <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">Listing Type</label>
                <Select value={filters.listing_type} onValueChange={(v) => setFilters({ ...filters, listing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">Property Type</label>
                <Select value={filters.property_type} onValueChange={(v) => setFilters({ ...filters, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">State</label>
                <Select value={filters.state} onValueChange={(v) => setFilters({ ...filters, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">Bedrooms</label>
                <Select value={filters.bedrooms} onValueChange={(v) => setFilters({ ...filters, bedrooms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">Apply</Button>
                <Button variant="ghost" onClick={clearFilters} size="icon"><X className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 max-w-md">
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">Min Price (₦)</label>
                <Input type="number" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground block mb-1.5">Max Price (₦)</label>
                <Input type="number" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} placeholder="500,000,000" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-muted-foreground">
              {loading ? "Searching..." : `${properties.length} properties found`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <Link key={prop.id} to={`/property/${prop.id}`} className="block">
                  <Card className="overflow-hidden card-hover">
                    <div className="relative aspect-[4/3]">
                      {prop.images?.[0] ? (
                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        {listingTypeLabels[prop.listing_type] || prop.listing_type}
                      </Badge>
                      {prop.featured && (
                        <Badge className="absolute top-3 left-24 bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(prop.id); }}
                        className="absolute top-3 right-3 w-9 h-9 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(prop.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <p className="font-display text-lg font-bold text-accent">{formatPrice(prop.price)}</p>
                      <h3 className="font-body text-sm font-semibold text-foreground mt-1 line-clamp-1">{prop.title}</h3>
                      <p className="text-muted-foreground text-xs font-body mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {prop.city}, {prop.state}
                      </p>
                      {(prop.bedrooms || prop.bathrooms || prop.area_sqm) && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                          {prop.bedrooms && (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                              <BedDouble className="w-3.5 h-3.5" /> {prop.bedrooms} Beds
                            </span>
                          )}
                          {prop.bathrooms && (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                              <Bath className="w-3.5 h-3.5" /> {prop.bathrooms} Baths
                            </span>
                          )}
                          {prop.area_sqm && (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                              <Maximize className="w-3.5 h-3.5" /> {prop.area_sqm}m²
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
