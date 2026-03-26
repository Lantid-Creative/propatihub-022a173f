import { Link } from "react-router-dom";
import { FileText, Sparkles, Mail, LayoutDashboard, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Sparkles,
    text: "Generate Legal Contracts in minutes with our AI",
  },
  {
    icon: Mail,
    text: "Send Contracts via Email or WhatsApp",
  },
  {
    icon: LayoutDashboard,
    text: "Keep Track of all Contracts in one Dashboard",
  },
];

const LegalContractSection = () => (
  <section className="py-20 px-6 bg-primary/[0.03]">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* Right visual first on mobile, left on desktop */}
        <div className="order-2 lg:order-1">
          <span className="inline-block bg-accent/15 text-accent-foreground font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Digital Legal Contract
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 leading-tight">
            No Need for Extra Legal Agreements
          </h2>
          <p className="text-muted-foreground font-body mb-8 leading-relaxed">
            Our Digital Legal Contract covers you. We've partnered with top property lawyers and an AI assistant to draft legal agreements. With just a click, you can access certified legal contracts on the go.
          </p>

          <div className="space-y-4 mb-8">
            {highlights.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <h.icon className="w-4.5 h-4.5 text-accent" />
                </div>
                <span className="font-body text-sm font-medium text-foreground">{h.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/property-management">
              <Button className="bg-primary text-primary-foreground font-semibold">
                Generate a Contract
              </Button>
            </Link>
            <Link to="/tenant-portal">
              <Button variant="outline" className="font-semibold">
                View My Contracts
              </Button>
            </Link>
          </div>
        </div>

        {/* Contract mockup */}
        <div className="order-1 lg:order-2 bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Scale className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Tenancy Agreement</span>
            <span className="ml-auto bg-accent/15 text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">AI Generated</span>
          </div>

          <div className="space-y-3 text-xs font-body text-muted-foreground">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground text-sm mb-1">PARTIES</p>
              <p><span className="text-foreground font-medium">Landlord:</span> Chief Emeka Obi</p>
              <p><span className="text-foreground font-medium">Tenant:</span> Adaeze Obioma</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground text-sm mb-1">PROPERTY</p>
              <p>3 Bedroom Apartment, Victoria Island, Lagos</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm mb-1">RENT</p>
                <p>₦2,500,000/year</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm mb-1">TERM</p>
                <p>12 Months</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground text-sm mb-1">CLAUSE 1 — OBLIGATIONS</p>
              <p className="leading-relaxed">The Tenant shall pay the agreed rent on or before the due date and maintain the property in good tenantable condition...</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span>AI-drafted · Lawyer-reviewed template · Legally binding</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default LegalContractSection;
