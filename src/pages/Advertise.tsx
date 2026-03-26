import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Eye, BarChart3, Star, Megaphone } from "lucide-react";

const benefits = [
  { icon: Eye, title: "Maximum exposure", desc: "Your listings seen by thousands of active property seekers across Nigeria every day." },
  { icon: Users, title: "Qualified leads", desc: "Connect with serious buyers and renters who are ready to make decisions." },
  { icon: BarChart3, title: "Performance analytics", desc: "Track views, inquiries, and engagement with detailed reporting dashboards." },
  { icon: Star, title: "Featured listings", desc: "Boost visibility with premium placement at the top of search results." },
  { icon: TrendingUp, title: "Market insights", desc: "Access pricing data and market trends to stay ahead of the competition." },
  { icon: Megaphone, title: "Brand promotion", desc: "Build your agency brand with a verified profile and customer reviews." },
];

const plans = [
  { name: "Starter", price: "₦25,000/mo", features: ["Up to 10 listings", "Basic analytics", "Email support"] },
  { name: "Professional", price: "₦75,000/mo", features: ["Up to 50 listings", "Featured placement", "Advanced analytics", "Priority support"], popular: true },
  { name: "Enterprise", price: "Custom", features: ["Unlimited listings", "Dedicated account manager", "API access", "Custom branding"] },
];

const Advertise = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Advertise with PropatiHub</h1>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">Reach Nigeria's largest audience of property seekers. List your properties where buyers and renters are looking.</p>
        <Link to="/auth"><Button size="lg" variant="secondary" className="mt-6">Get started</Button></Link>
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-6 py-16 w-full">
      <h2 className="font-heading text-2xl font-bold mb-8 text-center">Why advertise with us?</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b) => (
          <Card key={b.title}>
            <CardContent className="p-6">
              <b.icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <section className="bg-muted">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-bold mb-8 text-center">Plans & pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card key={p.name} className={p.popular ? "border-accent ring-2 ring-accent" : ""}>
              <CardContent className="p-8 text-center">
                {p.popular && <span className="text-xs font-bold uppercase tracking-wider text-accent">Most Popular</span>}
                <h3 className="font-heading text-xl font-bold mt-2">{p.name}</h3>
                <p className="text-2xl font-heading font-bold text-accent my-4">{p.price}</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  {p.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <Link to="/auth"><Button variant={p.popular ? "default" : "outline"} className="w-full">Choose plan</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Advertise;
