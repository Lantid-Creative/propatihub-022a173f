import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Home, CreditCard, Key, ShieldCheck } from "lucide-react";

const steps = [
  { icon: Search, title: "1. Define your needs", desc: "Decide on location, budget, property type, and must-have features. Consider commute times, neighbourhood safety, and proximity to amenities." },
  { icon: CreditCard, title: "2. Budget properly", desc: "Factor in rent, agency fee (usually one year's rent), caution deposit, agreement fee, and utility deposits." },
  { icon: Home, title: "3. View properties", desc: "Visit shortlisted properties in person. Check water supply, power, security, and structural integrity." },
  { icon: FileText, title: "4. Review the tenancy agreement", desc: "Read every clause carefully. Ensure terms cover rent review, maintenance responsibilities, and notice period." },
  { icon: ShieldCheck, title: "5. Verify the landlord", desc: "Confirm the landlord's identity and ownership. Request property documents to avoid scams." },
  { icon: Key, title: "6. Pay & move in", desc: "Make payments through verified channels, collect receipts, and document the property condition before moving in." },
];

const tips = [
  "Always insist on a formal tenancy agreement",
  "Take photos/videos of the property before moving in",
  "Know your rights under Nigerian tenancy law",
  "Never pay rent without a valid receipt",
  "Join or form a tenant association for your estate",
  "Report maintenance issues in writing to your landlord",
];

const RentingGuide = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <PageSEO title="Renting Guide — How to Rent Property in Nigeria" description="Complete guide to renting in Nigeria. Tips on budgeting, viewing properties, tenancy agreements, and knowing your rights." canonical="/renting-guide" />
    <section className="bg-primary pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Renting guide</h1>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">Your complete guide to renting property in Nigeria — from searching to signing your tenancy agreement.</p>
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-6 py-16 w-full">
      <h2 className="font-heading text-2xl font-bold mb-10">Steps to renting a property</h2>
      <div className="grid gap-8">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardContent className="flex gap-5 p-6">
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <section className="bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-bold mb-8">Top renting tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                <p className="text-sm">{tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    </div>
);

export default RentingGuide;
