import { ShieldCheck, Lock, BadgeCheck, Star, Quote } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Escrow Protected" },
  { icon: Lock, label: "Paystack Secured" },
  { icon: BadgeCheck, label: "Verified Agents" },
];

const testimonials = [
  {
    quote: "The escrow system gave me peace of mind. I got my full caution fee back within 48 hours of moving out.",
    name: "Adaeze O.",
    role: "Tenant, Lagos",
    rating: 5,
  },
  {
    quote: "Managing 30+ units used to be chaos. Now rent collection, maintenance, and documents are all in one place.",
    name: "Chukwudi E.",
    role: "Property Manager, Abuja",
    rating: 5,
  },
  {
    quote: "I no longer worry about caution fee disputes. The platform handles everything transparently for both parties.",
    name: "Funke A.",
    role: "Landlord, Port Harcourt",
    rating: 5,
  },
];

const TrustSection = () => (
  <section className="py-20 px-6 bg-muted/40">
    <div className="max-w-7xl mx-auto">
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
        {badges.map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-2.5 bg-background border border-border rounded-full px-5 py-2.5 shadow-sm"
          >
            <b.icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Trusted by Landlords & Tenants
        </h2>
        <p className="text-muted-foreground font-body max-w-xl mx-auto">
          See why property owners and renters across Nigeria choose PropatiHub for secure, transparent property management.
        </p>
      </div>

      {/* Testimonials */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-background rounded-2xl border border-border p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
          >
            <div>
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-foreground font-body text-sm leading-relaxed mb-5">
                "{t.quote}"
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
