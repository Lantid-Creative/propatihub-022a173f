import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { MapPin, Building2, Home, Gavel, Key, TreePine } from "lucide-react";

const geopoliticalZones = [
  {
    zone: "South-West",
    icon: Building2,
    description: "Nigeria's economic hub",
    states: [
      { name: "Lagos", cities: ["Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Ajah", "Surulere", "Yaba"] },
      { name: "Oyo", cities: ["Ibadan", "Ogbomoso", "Oyo"] },
      { name: "Ogun", cities: ["Abeokuta", "Sagamu", "Ijebu-Ode"] },
      { name: "Osun", cities: ["Osogbo", "Ile-Ife", "Ede"] },
      { name: "Ondo", cities: ["Akure", "Ondo", "Owo"] },
      { name: "Ekiti", cities: ["Ado-Ekiti", "Ikere", "Oye"] },
    ],
  },
  {
    zone: "South-East",
    icon: TreePine,
    description: "Cultural heartland",
    states: [
      { name: "Enugu", cities: ["Enugu", "Nsukka", "Agbani"] },
      { name: "Anambra", cities: ["Awka", "Onitsha", "Nnewi"] },
      { name: "Imo", cities: ["Owerri", "Orlu", "Okigwe"] },
      { name: "Abia", cities: ["Umuahia", "Aba"] },
      { name: "Ebonyi", cities: ["Abakaliki", "Afikpo"] },
    ],
  },
  {
    zone: "South-South",
    icon: MapPin,
    description: "Oil-rich Niger Delta",
    states: [
      { name: "Rivers", cities: ["Port Harcourt", "Obio-Akpor", "Eleme"] },
      { name: "Delta", cities: ["Asaba", "Warri", "Sapele"] },
      { name: "Edo", cities: ["Benin City", "Auchi", "Ekpoma"] },
      { name: "Akwa Ibom", cities: ["Uyo", "Eket", "Ikot Ekpene"] },
      { name: "Cross River", cities: ["Calabar", "Ikom"] },
      { name: "Bayelsa", cities: ["Yenagoa"] },
    ],
  },
  {
    zone: "North-Central",
    icon: Home,
    description: "Middle Belt & the capital",
    states: [
      { name: "FCT", cities: ["Abuja", "Maitama", "Wuse", "Gwarinpa", "Asokoro", "Garki", "Jabi"] },
      { name: "Kwara", cities: ["Ilorin", "Offa"] },
      { name: "Plateau", cities: ["Jos", "Bukuru"] },
      { name: "Niger", cities: ["Minna", "Suleja", "Bida"] },
      { name: "Nasarawa", cities: ["Lafia", "Keffi"] },
      { name: "Benue", cities: ["Makurdi", "Otukpo"] },
      { name: "Kogi", cities: ["Lokoja", "Okene"] },
    ],
  },
  {
    zone: "North-West",
    icon: Building2,
    description: "Commercial north",
    states: [
      { name: "Kano", cities: ["Kano", "Wudil"] },
      { name: "Kaduna", cities: ["Kaduna", "Zaria", "Kafanchan"] },
      { name: "Sokoto", cities: ["Sokoto"] },
      { name: "Katsina", cities: ["Katsina", "Daura", "Funtua"] },
      { name: "Zamfara", cities: ["Gusau"] },
      { name: "Kebbi", cities: ["Birnin Kebbi"] },
      { name: "Jigawa", cities: ["Dutse", "Hadejia"] },
    ],
  },
  {
    zone: "North-East",
    icon: MapPin,
    description: "Emerging frontiers",
    states: [
      { name: "Bauchi", cities: ["Bauchi"] },
      { name: "Borno", cities: ["Maiduguri"] },
      { name: "Adamawa", cities: ["Yola", "Jimeta"] },
      { name: "Gombe", cities: ["Gombe"] },
      { name: "Taraba", cities: ["Jalingo"] },
      { name: "Yobe", cities: ["Damaturu", "Potiskum"] },
    ],
  },
];

const sitemapSections = [
  { title: "Browse Properties", links: [
    { label: "Properties for sale", href: "/for-sale" },
    { label: "Properties to rent", href: "/to-rent" },
    { label: "All properties", href: "/properties" },
    { label: "Short let properties", href: "/properties?type=short_let" },
    { label: "Land for sale", href: "/properties?type=land" },
    { label: "Commercial property", href: "/properties?property=commercial" },
    { label: "Bid / Auction properties", href: "/bid" },
  ]},
  { title: "Tools & Resources", links: [
    { label: "House prices", href: "/house-prices" },
    { label: "Property valuation", href: "/property-valuation" },
    { label: "Mortgage calculator", href: "/mortgage-calculator" },
    { label: "Find estate agents", href: "/find-agents" },
    { label: "Buying guide", href: "/buying-guide" },
    { label: "Renting guide", href: "/renting-guide" },
    { label: "NYSC housing", href: "/nysc-housing" },
  ]},
  { title: "Company", links: [
    { label: "About PropatiHub", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact us", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Advertise with us", href: "/advertise" },
    { label: "API access", href: "/api-access" },
  ]},
  { title: "Legal", links: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ]},
];

const listingTypes = [
  { label: "for sale", param: "sale", icon: Gavel },
  { label: "to rent", param: "rent", icon: Key },
];

const Sitemap = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-2">Sitemap</h1>
        <p className="text-primary-foreground/70 text-lg">Browse every page on PropatiHub</p>
      </div>
    </section>

    {/* General sections */}
    <section className="max-w-6xl mx-auto px-6 py-14 w-full">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {sitemapSections.map((section) => (
          <div key={section.title}>
            <h2 className="font-heading font-semibold text-lg mb-4 text-foreground">{section.title}</h2>
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

    {/* Geopolitical zones */}
    <section className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-14 w-full">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Properties by Location</h2>
        <p className="text-muted-foreground mb-10">Explore properties across all 36 states and the FCT, grouped by geopolitical zone.</p>

        <div className="space-y-12">
          {geopoliticalZones.map((zone) => {
            const Icon = zone.icon;
            return (
              <div key={zone.zone} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-1">
                  <Icon className="h-5 w-5 text-accent" />
                  <h3 className="font-heading text-xl font-semibold text-foreground">{zone.zone}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-8">{zone.description}</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {zone.states.map((state) => (
                    <div key={state.name}>
                      <Link
                        to={`/properties?q=${encodeURIComponent(state.name)}`}
                        className="font-semibold text-sm text-foreground hover:text-accent transition-colors"
                      >
                        {state.name} State
                      </Link>
                      <ul className="mt-2 space-y-1.5">
                        {state.cities.map((city) => (
                          <li key={city} className="flex flex-wrap gap-x-3 gap-y-1">
                            {listingTypes.map((lt) => (
                              <Link
                                key={lt.param}
                                to={`/properties?q=${encodeURIComponent(city)}&type=${lt.param}`}
                                className="text-xs text-muted-foreground hover:text-accent transition-colors"
                              >
                                {city} {lt.label}
                              </Link>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Sitemap;
