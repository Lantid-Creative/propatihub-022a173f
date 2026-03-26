import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Wrench, FileText, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const pmFeatures = [
  {
    icon: Users,
    title: "Tenant Invitations",
    desc: "Invite tenants via email, onboard them seamlessly, and manage lease agreements digitally.",
  },
  {
    icon: ShieldCheck,
    title: "Caution Fee Escrow",
    desc: "Caution fees are securely held until the tenancy ends. Release only after proper evaluation.",
  },
  {
    icon: CreditCard,
    title: "Rent Collection",
    desc: "Track rent payments, send reminders, and collect via Paystack — cards, bank transfers & USSD.",
  },
  {
    icon: Wrench,
    title: "Maintenance Requests",
    desc: "Tenants submit requests with photos. Track from open to resolved — all in one place.",
  },
  {
    icon: FileText,
    title: "Lease Documents",
    desc: "Upload and manage lease agreements, inventories, and tenancy documents securely.",
  },
  {
    icon: Building2,
    title: "Portfolio Overview",
    desc: "See all your rental properties, active tenancies, income, and occupancy at a glance.",
  },
];

const PMShowcaseSection = () => {
  return (
    <section className="py-20 px-6 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-accent/10 text-accent font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            New Feature
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            Property Management, Simplified
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Manage your rental properties, collect payments securely, and keep tenants happy — all from one dashboard.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pmFeatures.map((f) => (
            <div
              key={f.title}
              className="bg-background rounded-2xl p-6 border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/property-management">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
              Manage Your Properties
            </Button>
          </Link>
          <Link to="/tenant-portal">
            <Button size="lg" variant="outline" className="font-semibold px-8">
              Tenant Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PMShowcaseSection;
