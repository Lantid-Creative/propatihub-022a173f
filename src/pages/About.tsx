import PageSEO from "@/components/PageSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MapPin, TrendingUp, Shield, Heart } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Properties listed" },
  { value: "500+", label: "Verified agents" },
  { value: "36 + FCT", label: "States covered" },
  { value: "50,000+", label: "Monthly visitors" },
];

const values = [
  { icon: Shield, title: "Trust & Transparency", desc: "We verify agents and ensure accurate property listings so you can search with confidence." },
  { icon: Heart, title: "Customer First", desc: "Every feature we build starts with a question: does this make finding a home easier?" },
  { icon: MapPin, title: "Local Expertise", desc: "Deep knowledge of the Nigerian property market across all 36 states and the FCT." },
  { icon: TrendingUp, title: "Innovation", desc: "We leverage technology to bring transparency and efficiency to Nigerian real estate." },
];

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <PageSEO title="About PropatiHub" description="Learn about Nigeria's trusted property platform connecting buyers, renters, agents, and agencies across all 36 states + FCT." canonical="/about" />
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">About PropatiHub</h1>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">Nigeria's leading property platform — connecting buyers, renters, agents, and agencies across the country.</p>
      </div>
    </section>

    {/* Stats */}
    <section className="max-w-5xl mx-auto px-6 -mt-8 mb-12 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center">
            <CardContent className="p-6">
              <p className="text-2xl font-heading font-bold text-accent">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Story */}
    <section className="max-w-3xl mx-auto px-6 pb-16 w-full">
      <h2 className="font-heading text-2xl font-bold mb-4">Our story</h2>
      <div className="prose prose-muted max-w-none text-muted-foreground space-y-4">
        <p>PropatiHub was founded with a simple mission: to make finding property in Nigeria as straightforward and transparent as possible. The Nigerian property market has long suffered from fragmented listings, unverified agents, and a lack of reliable pricing data.</p>
        <p>We set out to change that by building a platform that brings together verified estate agents, accurate property data, and powerful search tools — all in one place. Whether you're buying your dream home in Lagos, renting an apartment in Abuja, or searching for commercial space in Port Harcourt, PropatiHub has you covered.</p>
        <p>Today, PropatiHub is trusted by thousands of Nigerians to help them make one of the most important decisions of their lives. We continue to innovate with tools like our property valuation engine, mortgage calculator, and house prices tracker to bring much-needed transparency to the market.</p>
      </div>
    </section>

    {/* Values */}
    <section className="bg-muted">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-bold mb-8 text-center">Our values</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <Card key={v.title}>
              <CardContent className="flex gap-4 p-6">
                <v.icon className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default About;
