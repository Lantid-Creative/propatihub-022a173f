import lagosImg from "@/assets/lagos.jpg";
import abujaImg from "@/assets/abuja.jpg";
import phImg from "@/assets/port-harcourt.jpg";
import ibadanImg from "@/assets/ibadan.jpg";

const locations = [
  { name: "Lagos", count: "8,500+", image: lagosImg },
  { name: "Abuja", count: "4,200+", image: abujaImg },
  { name: "Port Harcourt", count: "1,800+", image: phImg },
  { name: "Ibadan", count: "950+", image: ibadanImg },
];

const LocationsSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Browse by Location
            </h2>
            <p className="text-muted-foreground font-body mt-2">
              Explore properties in Nigeria's most sought-after cities
            </p>
          </div>
          <a
            href="#"
            className="hidden md:block text-accent font-body font-medium hover:underline"
          >
            View all locations →
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {locations.map((loc) => (
            <div key={loc.name} className="location-card group aspect-[3/4]">
              <img
                src={loc.image}
                alt={`Properties in ${loc.name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                width={640}
                height={640}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">
                  {loc.name}
                </h3>
                <p className="text-primary-foreground/70 font-body text-sm mt-1">
                  {loc.count} properties
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
