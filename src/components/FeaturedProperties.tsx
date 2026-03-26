import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bath, BedDouble, Maximize, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const listingTypeLabels: Record<string, string> = {
  sale: "For Sale",
  rent: "For Rent",
  short_let: "Short Let",
  land: "Land",
};

const tagColors: Record<string, string> = {
  "For Sale": "bg-primary text-primary-foreground",
  "For Rent": "bg-accent text-accent-foreground",
  "Short Let": "bg-foreground text-background",
  "Land": "bg-green-light text-primary-foreground",
};

// Fallback static data for when database is empty
const fallbackProperties = [
  {
    id: "demo-1",
    title: "Luxury 5-Bedroom Detached Duplex",
    city: "Lekki Phase 1",
    state: "Lagos",
    price: 185000000,
    bedrooms: 5,
    bathrooms: 6,
    area_sqm: 450,
    listing_type: "sale",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop"],
  },
  {
    id: "demo-2",
    title: "Modern 3-Bedroom Apartment",
    city: "Maitama",
    state: "Abuja",
    price: 4500000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 180,
    listing_type: "rent",
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop"],
  },
  {
    id: "demo-3",
    title: "Stunning Waterfront Penthouse",
    city: "Banana Island",
    state: "Lagos",
    price: 650000000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqm: 380,
    listing_type: "sale",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"],
  },
  {
    id: "demo-4",
    title: "4-Bedroom Semi-Detached",
    city: "GRA",
    state: "Rivers",
    price: 95000000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqm: 280,
    listing_type: "sale",
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop"],
  },
];

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>(fallbackProperties);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      if (data && data.length > 0) setProperties(data);
    };
    const fetchFavs = async () => {
      if (!user) return;
      const { data } = await supabase.from("favorites").select("property_id").eq("user_id", user.id);
      setFavorites((data || []).map((f) => f.property_id));
    };
    fetchFeatured();
    fetchFavs();
  }, [user]);

  const toggleLike = async (id: string) => {
    if (!user) {
      toast({ title: "Sign in to save favourites", variant: "destructive" });
      return;
    }
    if (id.startsWith("demo-")) return;
    if (favorites.includes(id)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", id);
      setFavorites((prev) => prev.filter((x) => x !== id));
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: id });
      setFavorites((prev) => [...prev, id]);
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-3">
          Featured Properties
        </h2>
        <p className="text-muted-foreground font-body text-center mb-12 max-w-lg mx-auto">
          Hand-picked premium listings verified by our team across Nigeria
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((prop) => {
            const tag = listingTypeLabels[prop.listing_type] || "For Sale";
            const isDemo = String(prop.id).startsWith("demo-");
            const Wrapper = isDemo ? "div" : Link;
            const wrapperProps = isDemo ? {} : { to: `/property/${prop.id}` };

            return (
              <Wrapper
                key={prop.id}
                {...(wrapperProps as any)}
                className="bg-card rounded-xl overflow-hidden card-hover shadow-sm block"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={prop.images?.[0] || ""}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-body font-semibold ${tagColors[tag] || "bg-primary text-primary-foreground"}`}>
                    {tag}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(prop.id); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-card"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(prop.id)
                          ? "fill-destructive text-destructive"
                          : "text-foreground"
                      }`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-bold text-accent">
                    {formatPrice(prop.price)}
                  </p>
                  <h3 className="font-body text-sm font-semibold text-foreground mt-1 line-clamp-1">
                    {prop.title}
                  </h3>
                  <p className="text-muted-foreground text-xs font-body mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {prop.city}, {prop.state}
                  </p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    {prop.bedrooms && (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                        <BedDouble className="w-3.5 h-3.5" /> {prop.bedrooms}
                      </span>
                    )}
                    {prop.bathrooms && (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                        <Bath className="w-3.5 h-3.5" /> {prop.bathrooms}
                      </span>
                    )}
                    {prop.area_sqm && (
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                        <Maximize className="w-3.5 h-3.5" /> {prop.area_sqm}m²
                      </span>
                    )}
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/properties"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-body font-medium hover:bg-primary/90 transition-colors"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
