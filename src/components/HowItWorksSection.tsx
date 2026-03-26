import { ArrowRight, UserPlus, ShieldCheck, Home, BanknoteIcon, CheckCircle2, KeyRound } from "lucide-react";

const landlordSteps = [
  { icon: UserPlus, title: "Invite Tenant", desc: "Send an email invitation with lease terms and caution fee amount." },
  { icon: BanknoteIcon, title: "Tenant Pays", desc: "Tenant pays caution fee securely via Paystack. Funds are held in escrow." },
  { icon: Home, title: "Manage Tenancy", desc: "Track rent, handle maintenance, and manage documents from your dashboard." },
  { icon: CheckCircle2, title: "Release Escrow", desc: "At lease end, request release. Funds returned to tenant after evaluation." },
];

const tenantSteps = [
  { icon: KeyRound, title: "Accept Invitation", desc: "Receive an invite, sign up, and review your lease terms." },
  { icon: ShieldCheck, title: "Pay Caution Fee", desc: "Pay securely via card, bank transfer, or USSD. Your money is protected in escrow." },
  { icon: Home, title: "Move In & Live", desc: "Access your portal to pay rent, submit maintenance requests, and view documents." },
  { icon: BanknoteIcon, title: "Get Refund", desc: "When your lease ends, your caution fee is released back to you — hassle-free." },
];

const StepRow = ({ steps, label }: { steps: typeof landlordSteps; label: string }) => (
  <div>
    <h3 className="font-display text-lg font-bold text-foreground mb-6 text-center">{label}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((s, i) => (
        <div key={s.title} className="relative flex flex-col items-center text-center p-5 rounded-2xl bg-background border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <s.icon className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground mb-1">Step {i + 1}</span>
          <h4 className="font-display font-bold text-foreground text-sm mb-1">{s.title}</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
          {i < steps.length - 1 && (
            <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  </div>
);

const HowItWorksSection = () => (
  <section className="py-20 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          How Caution Fee Escrow Works
        </h2>
        <p className="text-muted-foreground font-body max-w-2xl mx-auto">
          Your money is protected from day one. Here's how the process works for both sides.
        </p>
      </div>
      <div className="space-y-14">
        <StepRow steps={landlordSteps} label="For Landlords & Property Managers" />
        <StepRow steps={tenantSteps} label="For Tenants" />
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
