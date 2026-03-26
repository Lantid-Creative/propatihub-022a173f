import { Link } from "react-router-dom";

const categories = [
  { label: "Properties for sale", href: "/for-sale" },
  { label: "Properties to rent", href: "/to-rent" },
  { label: "Commercial property", href: "/properties?property=commercial" },
  { label: "Short let properties", href: "/properties?type=short_let" },
  { label: "Land for sale", href: "/properties?type=land" },
  { label: "New developments", href: "/properties?type=sale&property=house" },
];

const researchTools = [
  { label: "Mortgage calculator", href: "/mortgage-calculator" },
  { label: "House prices", href: "/house-prices" },
  { label: "Property valuation", href: "/property-valuation" },
  { label: "Find estate agents", href: "/find-agents" },
  { label: "Buying guide", href: "/buying-guide" },
  { label: "Renting guide", href: "/renting-guide" },
];

const ExploreSection = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Property categories */}
          <div className="bg-accent/5 rounded-2xl p-8 md:p-10">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Explore property categories
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.href}
                  className="block font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground hover:text-accent transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Research tools */}
          <div className="bg-accent/5 rounded-2xl p-8 md:p-10">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Handy tools to power your property research
            </h3>
            <div className="space-y-3">
              {researchTools.map((tool) => (
                <Link
                  key={tool.label}
                  to={tool.href}
                  className="block font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/20 hover:decoration-foreground hover:text-accent transition-colors"
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
