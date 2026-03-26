import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 5000,
    period: "month",
    icon: Zap,
    description: "Perfect for new agents getting started",
    features: [
      "5 active listings",
      "Basic analytics",
      "Email support",
      "Standard listing placement",
      "Lead notifications",
    ],
    limits: { listings: 5, featured: 0 },
  },
  {
    id: "professional",
    name: "Professional",
    price: 15000,
    period: "month",
    icon: Star,
    popular: true,
    description: "For growing agents who want more visibility",
    features: [
      "25 active listings",
      "Advanced analytics & reports",
      "Priority support",
      "Featured agent badge",
      "3 featured listings/month",
      "Lead insights & contact info",
      "Social media sharing tools",
    ],
    limits: { listings: 25, featured: 3 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 50000,
    period: "month",
    icon: Crown,
    description: "For top agents who want maximum exposure",
    features: [
      "Unlimited active listings",
      "Full analytics dashboard",
      "Dedicated account manager",
      "Top search placement",
      "10 featured listings/month",
      "Priority lead routing",
      "Custom agent profile page",
      "API access",
    ],
    limits: { listings: -1, featured: 10 },
  },
];

const AgentBilling = () => {
  const [currentPlan] = useState("starter");
  const { toast } = useToast();

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Coming soon!",
      description: "Billing integration is being set up. You'll be notified when it's ready.",
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your PropatiHub subscription plan</p>
      </div>

      {/* Current Plan Banner */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Current Plan</p>
            <p className="text-xl font-display font-bold text-foreground capitalize mt-0.5">{currentPlan}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Your plan renews on {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary text-sm px-3 py-1">Active</Badge>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all ${
                plan.popular ? "border-accent border-2 shadow-lg" : ""
              } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-body font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <plan.icon className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="text-lg font-display">{plan.name}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground font-body">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-3xl font-display font-bold text-foreground">₦{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground font-body">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-body text-foreground">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full gap-2 ${plan.popular ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plans.findIndex((p) => p.id === plan.id) > plans.findIndex((p) => p.id === currentPlan) ? "Upgrade" : "Downgrade"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Active Listings</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-display font-bold text-foreground">0</span>
                <span className="text-sm text-muted-foreground font-body mb-0.5">/ 5</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mt-2">
                <div className="h-full bg-accent rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Featured Listings</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-display font-bold text-foreground">0</span>
                <span className="text-sm text-muted-foreground font-body mb-0.5">/ 0</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mt-2">
                <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Leads This Month</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-display font-bold text-foreground">0</span>
                <span className="text-sm text-muted-foreground font-body mb-0.5">unlimited</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgentBilling;
