import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Waves, TreePine, MapPin } from "lucide-react";

type ListingMode = "sale" | "rent";

const categories = [
  {
    title: "Major cities",
    description: "Live in Nigeria's economic hubs",
    icon: Building2,
    cities: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Kaduna", "Benin City", "Owerri", "Jos", "Maiduguri", "Aba"],
  },
  {
    title: "Coastal & waterfront",
    description: "Wake up to fresh air and sea views",
    icon: Waves,
    cities: ["Calabar", "Warri", "Uyo", "Lekki", "Badagry", "Bonny", "Epe", "Ilaje", "Brass", "Eket"],
  },
  {
    title: "Emerging markets",
    description: "Affordable growth areas with high potential",
    icon: TreePine,
    cities: ["Asaba", "Awka", "Abeokuta", "Ilorin", "Owerri", "Minna", "Lafia", "Lokoja", "Suleja", "Sagamu", "Nnewi", "Onitsha"],
  },
  {
    title: "Popular locations",
    description: "Move to a property hotspot",
    icon: MapPin,
    cities: ["Lekki Phase 1", "Ikoyi", "Victoria Island", "Maitama", "Wuse 2", "GRA Ikeja", "Asokoro", "Gwarinpa", "Ajah", "Banana Island", "Jabi", "Garki"],
    showAllLink: true,
  },
];

const LocationsSection = () => {
  const [mode, setMode] = useState<ListingMode>("sale");

  const label = mode === "sale" ? "for sale" : "to rent";
  const typeParam = mode === "sale" ? "sale" : "rent";

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Discover towns &amp; cities
          </h2>

          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMode("sale")}
                className={`px-4 py-2 text-sm font-body font-semibold transition-colors ${
                  mode === "sale"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                For sale
              </button>
              <button
                onClick={() => setMode("rent")}
                className={`px-4 py-2 text-sm font-body font-semibold transition-colors ${
                  mode === "rent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                To rent
              </button>
            </div>

            <Link
              to="/sitemap"
              className="hidden md:flex items-center gap-1 text-sm font-body font-medium text-accent hover:underline"
            >
              Explore more towns &amp; cities
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="divide-y divide-border">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 py-10 first:pt-0 last:pb-0"
              >
                {/* Left label */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">
                      {cat.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm mt-0.5">
                      {cat.description}
                    </p>
                    {cat.showAllLink && (
                      <Link
                        to={`/properties?type=${typeParam}`}
                        className="text-accent font-body text-sm font-medium hover:underline mt-2 inline-block"
                      >
                        See all Nigeria properties {label}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right links grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                  {cat.cities.map((city) => (
                    <Link
                      key={city}
                      to={`/properties?q=${encodeURIComponent(city)}&type=${typeParam}`}
                      className="group flex items-center gap-2 text-sm font-body text-foreground hover:text-accent transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                      <span className="underline underline-offset-2 decoration-muted-foreground/40 group-hover:decoration-accent">
                        {city} properties {label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/sitemap"
            className="text-sm font-body font-medium text-accent hover:underline"
          >
            Explore more towns &amp; cities →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
