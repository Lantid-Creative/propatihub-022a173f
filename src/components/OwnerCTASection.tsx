import { Link } from "react-router-dom";
import { Building2, ShieldCheck, PlusCircle, ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ctaCards = [
  {
    icon: PlusCircle,
    title: "List Your Property",
    desc: "Reach thousands of verified buyers and tenants across Nigeria. List for sale, rent, or short-let in minutes.",
    cta: "Start Listing",
    link: "/auth",
    accent: "from-primary to-primary/80",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "Manage Your Rentals",
    desc: "Invite tenants, collect rent via Paystack, handle maintenance, and manage documents — all from one dashboard.",
    cta: "Open Dashboard",
    link: "/agent/property-management",
    accent: "from-accent to-accent/80",
    iconBg: "bg-accent/10 text-accent",
  },
  {
    icon: ShieldCheck,
    title: "Secure Caution Fees",
    desc: "Hold caution fees in escrow. Protect tenants and landlords with automated, transparent release workflows.",
    cta: "Learn More",
    link: "/agent/property-management",
    accent: "from-blue-600 to-blue-500",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: Code2,
    title: "Property Data API",
    desc: "Access real-time property listings programmatically. Subscribe per LGA and integrate PropatiHub data into your own apps.",
    cta: "View API Docs",
    link: "/api-docs",
    accent: "from-emerald-600 to-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
];

const OwnerCTASection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-primary/10 text-primary font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            For Property Owners, Agents & Agencies
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            Grow Your Property Business with PropatiHub
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Whether you're listing a single apartment or managing a portfolio, we give you the tools to succeed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ctaCards.map((card) => (
            <div
              key={card.title}
              className="group relative bg-background rounded-2xl border border-border p-8 hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {card.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6 flex-1">
                {card.desc}
              </p>
              <Link to={card.link}>
                <Button className={`w-full bg-gradient-to-r ${card.accent} text-white hover:opacity-90 font-semibold`}>
                  {card.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary font-semibold hover:underline">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTASection;
