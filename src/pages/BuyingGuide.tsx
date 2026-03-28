import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Home, CreditCard, Key, ShieldCheck } from "lucide-react";

const steps = [
  { icon: Search, title: "1. Research the market", desc: "Understand property prices in your desired area. Use PropatiHub's house prices tool to compare values across states and cities in Nigeria." },
  { icon: CreditCard, title: "2. Sort your finances", desc: "Determine your budget, get mortgage pre-approval if needed, and ensure you have funds for the deposit, legal fees, and agency commissions." },
  { icon: FileText, title: "3. Make an offer", desc: "Once you find a property, make a formal offer through the estate agent. Negotiate the price based on market data and property condition." },
  { icon: ShieldCheck, title: "4. Legal checks & due diligence", desc: "Engage a solicitor to verify property titles, survey the land, check for encumbrances, and confirm the seller has the right to sell." },
  { icon: Home, title: "5. Exchange contracts", desc: "Once all checks are satisfactory, sign the contract of sale, pay the deposit, and agree on a completion date." },
  { icon: Key, title: "6. Complete & move in", desc: "Pay the remaining balance, receive the keys, and register the property in your name at the relevant land registry." },
];

const faqs = [
  { q: "How much deposit do I need?", a: "Typically 20-30% of the property price, though this varies by lender and property type." },
  { q: "What are the hidden costs?", a: "Budget for legal fees (2-5%), agency commission (5-10%), survey costs, and stamp duty where applicable." },
  { q: "How long does buying take?", a: "The process typically takes 3-6 months from initial search to moving in, depending on legal complexities." },
  { q: "Do I need a solicitor?", a: "Yes, always engage a qualified property lawyer to handle due diligence and protect your interests." },
];

const BuyingGuide = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <PageSEO title="Buying Guide — How to Buy Property in Nigeria" description="Step-by-step guide to buying property in Nigeria. From budgeting and mortgage advice to legal due diligence and moving in." canonical="/buying-guide" />
    <section className="bg-primary pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Buying guide</h1>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">Everything you need to know about buying property in Nigeria — from budgeting to getting the keys.</p>
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-6 py-16 w-full">
      <h2 className="font-heading text-2xl font-bold mb-10">Steps to buying a property</h2>
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
        <h2 className="font-heading text-2xl font-bold mb-8">Frequently asked questions</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
    </div>
);

export default BuyingGuide;
