import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import illustAffordability from "@/assets/illust-affordability.png";
import illustValuation from "@/assets/illust-valuation.png";
import illustResearch from "@/assets/illust-research.png";

const tools = [
  {
    image: illustAffordability,
    bg: "bg-green-light/10",
    title: "Find out what you can afford",
    desc: "Calculate your mortgage affordability and see homes that fit your budget.",
    link: "/mortgage-calculator",
    cta: "Mortgage calculator",
  },
  {
    image: illustValuation,
    bg: "bg-accent/10",
    title: "Get an instant property valuation",
    desc: "See what your home is worth with our market-leading online valuation.",
    link: "/property-valuation",
    cta: "Get your estimate",
  },
  {
    image: illustResearch,
    bg: "bg-[hsl(280_30%_95%)]",
    title: "Track house prices in your area",
    desc: "Keep tabs on property values, compare areas, and see recently sold properties.",
    link: "/house-prices",
    cta: "Discover house prices",
  },
];

const ToolsSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Feel empowered to make your next move
        </h2>
        <p className="text-muted-foreground font-body mb-12 max-w-2xl">
          Our range of tools can help you make confident, informed decisions about your home.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.title} className="group">
              <div className={`${tool.bg} rounded-2xl aspect-[4/3] flex items-center justify-center p-8 mb-5 overflow-hidden`}>
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-contain max-h-[220px] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {tool.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
                {tool.desc}
              </p>
              <Link
                to={tool.link}
                className="inline-flex items-center gap-1.5 font-body font-medium text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors group-hover:text-accent"
              >
                {tool.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
