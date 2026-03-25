import { Bell, Shield, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    desc: "Every property is physically verified by our agents before listing. No fake properties.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    desc: "Get notified immediately when new properties matching your criteria hit the market.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    desc: "Access real-time property valuation data and market trends across Nigerian cities.",
  },
  {
    icon: Users,
    title: "Trusted Agents",
    desc: "Connect with licensed and vetted real estate agents across all 36 states.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-3">
          Why Choose NaijaHomes?
        </h2>
        <p className="text-muted-foreground font-body text-center mb-14 max-w-lg mx-auto">
          The most trusted property platform built specifically for the Nigerian market
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <f.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
