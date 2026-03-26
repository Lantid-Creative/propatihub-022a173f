import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const sitemapSections = [
  { title: "Browse Properties", links: [
    { label: "Properties for sale", href: "/for-sale" },
    { label: "Properties to rent", href: "/to-rent" },
    { label: "All properties", href: "/properties" },
    { label: "Short let properties", href: "/properties?type=short_let" },
    { label: "Land for sale", href: "/properties?type=land" },
    { label: "Commercial property", href: "/properties?property=commercial" },
  ]},
  { title: "Tools & Resources", links: [
    { label: "House prices", href: "/house-prices" },
    { label: "Property valuation", href: "/property-valuation" },
    { label: "Mortgage calculator", href: "/mortgage-calculator" },
    { label: "Find estate agents", href: "/find-agents" },
    { label: "Buying guide", href: "/buying-guide" },
    { label: "Renting guide", href: "/renting-guide" },
  ]},
  { title: "Popular Locations", links: [
    { label: "Lagos", href: "/properties?q=Lagos" },
    { label: "Abuja", href: "/properties?q=Abuja" },
    { label: "Port Harcourt", href: "/properties?q=Port Harcourt" },
    { label: "Ibadan", href: "/properties?q=Ibadan" },
    { label: "Enugu", href: "/properties?q=Enugu" },
    { label: "Kano", href: "/properties?q=Kano" },
  ]},
  { title: "Company", links: [
    { label: "About PropatiHub", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact us", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Advertise with us", href: "/advertise" },
  ]},
  { title: "Legal", links: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ]},
];

const Sitemap = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Sitemap</h1>
      </div>
    </section>
    <section className="max-w-5xl mx-auto px-6 py-16 w-full">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {sitemapSections.map((section) => (
          <div key={section.title}>
            <h2 className="font-heading font-semibold text-lg mb-4">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default Sitemap;
