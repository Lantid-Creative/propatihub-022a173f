import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgencyBilling = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your agency subscription</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: "Agency Starter", price: "₦25,000/mo", features: ["10 agents", "50 listings", "Basic analytics", "Email support"] },
          { name: "Agency Pro", price: "₦75,000/mo", features: ["25 agents", "200 listings", "Advanced analytics", "Priority support", "Custom branding"], current: true },
          { name: "Agency Enterprise", price: "₦150,000/mo", features: ["Unlimited agents", "Unlimited listings", "Full analytics", "Dedicated manager", "API access"] },
        ].map((plan) => (
          <Card key={plan.name} className={plan.current ? "border-accent border-2" : ""}>
            <CardHeader>
              <CardTitle className="text-lg font-display">{plan.name}</CardTitle>
              <p className="text-2xl font-display font-bold text-accent">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm font-body text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {f}
                  </li>
                ))}
              </ul>
              {plan.current && <p className="mt-4 text-xs font-body text-accent font-medium">Current Plan</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AgencyBilling;
