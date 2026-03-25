import { Bath, BedDouble, Maximize, Heart } from "lucide-react";
import { useState } from "react";

const properties = [
  {
    id: 1,
    title: "Luxury 5-Bedroom Detached Duplex",
    location: "Lekki Phase 1, Lagos",
    price: "₦185,000,000",
    beds: 5,
    baths: 6,
    sqm: 450,
    tag: "For Sale",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Modern 3-Bedroom Apartment",
    location: "Maitama, Abuja",
    price: "₦4,500,000/yr",
    beds: 3,
    baths: 3,
    sqm: 180,
    tag: "For Rent",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Stunning Waterfront Penthouse",
    location: "Banana Island, Lagos",
    price: "₦650,000,000",
    beds: 4,
    baths: 5,
    sqm: 380,
    tag: "Premium",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "4-Bedroom Semi-Detached",
    location: "GRA, Port Harcourt",
    price: "₦95,000,000",
    beds: 4,
    baths: 4,
    sqm: 280,
    tag: "New",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
  },
];

const tagColors: Record<string, string> = {
  "For Sale": "bg-primary text-primary-foreground",
  "For Rent": "bg-accent text-accent-foreground",
  Premium: "bg-foreground text-background",
  New: "bg-green-light text-primary-foreground",
};

const FeaturedProperties = () => {
  const [liked, setLiked] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-card rounded-xl overflow-hidden card-hover shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-body font-semibold ${tagColors[prop.tag]}`}
                >
                  {prop.tag}
                </span>
                <button
                  onClick={() => toggleLike(prop.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-card"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      liked.includes(prop.id)
                        ? "fill-destructive text-destructive"
                        : "text-foreground"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4">
                <p className="font-display text-lg font-bold text-accent">
                  {prop.price}
                </p>
                <h3 className="font-body text-sm font-semibold text-foreground mt-1 line-clamp-1">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground text-xs font-body mt-1">
                  {prop.location}
                </p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                    <BedDouble className="w-3.5 h-3.5" /> {prop.beds}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                    <Bath className="w-3.5 h-3.5" /> {prop.baths}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs font-body">
                    <Maximize className="w-3.5 h-3.5" /> {prop.sqm}m²
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-body font-medium hover:bg-primary/90 transition-colors">
            View All Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
