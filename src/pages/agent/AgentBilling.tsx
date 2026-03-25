import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AgentBilling = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your PropatiHub subscription</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { name: "Starter", price: "₦5,000/mo", features: ["5 listings", "Basic analytics", "Email support"], current: true },
          { name: "Professional", price: "₦15,000/mo", features: ["25 listings", "Advanced analytics", "Priority support", "Featured badge"] },
          { name: "Enterprise", price: "₦50,000/mo", features: ["Unlimited listings", "Full analytics", "Dedicated manager", "Top placement"] },
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

export default AgentBilling;
