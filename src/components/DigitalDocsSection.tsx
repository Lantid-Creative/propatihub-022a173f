import { Link } from "react-router-dom";
import { FileText, Smartphone, Search, ShieldCheck, Clock, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Smartphone,
    title: "Capture Info Digitally",
    desc: "Collect tenant's personal details, ID, employment, next of kin, and guarantor — all from one smart form.",
  },
  {
    icon: Search,
    title: "Access Records Anytime",
    desc: "Pull up any tenant's record in seconds. No more digging through paper files or WhatsApp chats.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "All records are encrypted and access-controlled. Only you and the tenant can view their data.",
  },
  {
    icon: Clock,
    title: "Save Hours of Work",
    desc: "What used to take hours of manual entry now takes minutes. Tenants can even fill in their own details.",
  },
];

const DigitalDocsSection = () => (
  <section className="py-20 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* Left: Copy */}
        <div>
          <span className="inline-block bg-primary/10 text-primary font-body text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Digital Documentation
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 leading-tight">
            Go Digital! Goodbye to Paperwork
          </h2>
          <p className="text-muted-foreground font-body mb-8 leading-relaxed">
            Capture accurate tenants' information digitally in seconds and access tenants' records anytime, easily. No more lost files, no more stress.
          </p>

          <div className="space-y-5 mb-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-0.5">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link to="/property-management">
              <Button className="bg-primary text-primary-foreground font-semibold">
                Start Documenting
              </Button>
            </Link>
            <Link to="/tenant-portal">
              <Button variant="outline" className="font-semibold">
                Tenant Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Visual mockup */}
        <div className="bg-muted/50 rounded-2xl border border-border p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Tenant Record</span>
            <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Verified</span>
          </div>

          <div className="space-y-4">
            {[
              { label: "Full Name", value: "Adaeze Obioma" },
              { label: "ID Type", value: "NIN" },
              { label: "ID Number", value: "••••••••3847" },
              { label: "Employer", value: "TechCo Nigeria Ltd" },
              { label: "Next of Kin", value: "Chukwuemeka Obioma" },
              { label: "Guarantor", value: "Engr. Ifeanyi Okafor" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <CloudOff className="w-3.5 h-3.5" />
            <span>Stored securely · Accessible anytime</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DigitalDocsSection;
