import { Link } from "react-router-dom";
import { MessageSquare, Clock, ShieldCheck, Users, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: MessageSquare,
    title: "Log Your Complaint",
    desc: "File a dispute anytime — as a tenant, agent, or property owner. Describe the issue, attach evidence, and submit.",
  },
  {
    icon: Scale,
    title: "Expert Review",
    desc: "Our litigator reviews the case, contacts both parties, and provides swift legal guidance and mediation.",
  },
  {
    icon: ShieldCheck,
    title: "Resolution & Tracking",
    desc: "Track your dispute status in real-time. Receive updates and a formal resolution summary when the case is closed.",
  },
];

const DisputeSection = () => (
  <section className="py-20 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* Visual */}
        <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Dispute #1042</span>
            <span className="ml-auto bg-accent/15 text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">Under Review</span>
          </div>

          <div className="space-y-3 text-xs font-body text-muted-foreground">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground text-sm mb-1">COMPLAINT</p>
              <p>Landlord has refused to refund caution fee after lease expiry despite property being returned in good condition.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm mb-1">FILED BY</p>
                <p>Adaeze Obioma (Tenant)</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-semibold text-foreground text-sm mb-1">CATEGORY</p>
                <p>Caution Fee / Deposit</p>
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="font-semibold text-primary text-sm mb-1">LITIGATOR'S NOTE</p>
              <p className="text-foreground/80">Both parties have been contacted. Mediation session scheduled for March 28. Landlord advised to provide inspection report or release deposit per Lagos Tenancy Law 2011, S.17.</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Filed 2 days ago · Response within 24hrs</span>
          </div>
        </div>

        {/* Copy */}
        <div>
          <span className="inline-block bg-destructive/10 text-destructive font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            24/7 Dispute Management
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 leading-tight">
            Log Complaints Anytime, Get Swift Resolution
          </h2>
          <p className="text-muted-foreground font-body mb-8 leading-relaxed">
            As tenants, agents, and property owners, you can log complaints anytime. Our litigator steps in to provide swift resolution and guidance — so disputes don't drag on for months.
          </p>

          <div className="space-y-5 mb-8">
            {steps.map((s) => (
              <div key={s.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-0.5">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/property-management">
              <Button className="bg-primary text-primary-foreground font-semibold">
                File a Dispute
              </Button>
            </Link>
            <Link to="/tenant-portal">
              <Button variant="outline" className="font-semibold">
                Tenant Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DisputeSection;
