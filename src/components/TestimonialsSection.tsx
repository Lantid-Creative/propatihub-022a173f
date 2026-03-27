import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Chioma Okafor",
    role: "Homebuyer, Lagos",
    quote: "PropatiHub made finding my dream apartment in Lekki so easy. The verified listings saved me from scams I'd encountered on other platforms.",
    rating: 5,
    initials: "CO",
    bg: "bg-primary/10 text-primary",
  },
  {
    name: "Emeka Nwosu",
    role: "Property Agent, Abuja",
    quote: "Since listing on PropatiHub, my client inquiries have tripled. The dashboard tools for managing tenants and collecting rent are a game-changer.",
    rating: 5,
    initials: "EN",
    bg: "bg-accent/10 text-accent",
  },
  {
    name: "Aisha Mohammed",
    role: "Landlord, Port Harcourt",
    quote: "The escrow system for caution fees gives both me and my tenants peace of mind. Disputes are handled fairly and transparently.",
    rating: 5,
    initials: "AM",
    bg: "bg-blue-100 text-blue-600",
  },
  {
    name: "Tunde Adeyemi",
    role: "Agency Owner, Ibadan",
    quote: "The Property API lets us integrate PropatiHub data into our own app. ₦10k per LGA is incredible value for real-time listing data.",
    rating: 4,
    initials: "TA",
    bg: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Funke Balogun",
    role: "Tenant, Lagos",
    quote: "I love the tenant portal — paying rent, logging maintenance requests, and accessing my lease documents all in one place. So convenient!",
    rating: 5,
    initials: "FB",
    bg: "bg-purple-100 text-purple-600",
  },
  {
    name: "Ibrahim Sule",
    role: "NYSC Member, Enugu",
    quote: "The NYSC housing filter helped me find affordable accommodation near my PPA within my first week. Absolute lifesaver for corps members!",
    rating: 5,
    initials: "IS",
    bg: "bg-orange-100 text-orange-600",
  },
];

const stats = [
  { value: "10,000+", label: "Verified Listings" },
  { value: "36", label: "States Covered" },
  { value: "5,000+", label: "Happy Users" },
  { value: "99.9%", label: "Uptime" },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 p-8 rounded-2xl bg-primary/5 border border-primary/10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-accent/10 text-accent font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            What Our Users Are Saying
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            From first-time buyers to agency owners, hear how PropatiHub is transforming real estate in Nigeria.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group bg-background rounded-2xl border border-border p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground font-body text-sm leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div
                  className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center font-display font-bold text-sm`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">
                    {t.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
