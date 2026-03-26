import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Crown, Building2, Users, BarChart3, Headphones, Globe, Zap, Shield } from "lucide-react";

const plans = [
  {
    name: "Agency Starter",
    price: "₦25,000",
    period: "/month",
    description: "Perfect for small agencies just getting started",
    features: [
      { text: "Up to 10 agents", icon: Users },
      { text: "50 property listings", icon: Building2 },
      { text: "Basic analytics dashboard", icon: BarChart3 },
      { text: "Email support", icon: Headphones },
    ],
    limits: { agents: 10, listings: 50 },
  },
  {
    name: "Agency Professional",
    price: "₦75,000",
    period: "/month",
    description: "For growing agencies with established teams",
    current: true,
    popular: true,
    features: [
      { text: "Up to 25 agents", icon: Users },
      { text: "200 property listings", icon: Building2 },
      { text: "Advanced analytics & reports", icon: BarChart3 },
      { text: "Priority support", icon: Headphones },
      { text: "Custom agency branding", icon: Globe },
      { text: "Lead management tools", icon: Zap },
    ],
    limits: { agents: 25, listings: 200 },
  },
  {
    name: "Agency Enterprise",
    price: "₦150,000",
    period: "/month",
    description: "For large agencies needing unlimited access",
    features: [
      { text: "Unlimited agents", icon: Users },
      { text: "Unlimited listings", icon: Building2 },
      { text: "Full analytics suite", icon: BarChart3 },
      { text: "Dedicated account manager", icon: Headphones },
      { text: "API access", icon: Globe },
      { text: "White-label options", icon: Shield },
      { text: "Priority placement", icon: Crown },
    ],
    limits: { agents: 999, listings: 999 },
  },
];

const AgencyBilling = () => {
  const [currentUsage] = useState({ agents: 3, listings: 12 });
  const currentPlan = plans.find((p) => p.current);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your agency subscription and usage</p>
      </div>

      {/* Current Usage */}
      {currentPlan && (
        <Card className="mb-8 border-accent/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <Badge className="bg-accent/10 text-accent border-accent/30">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-body text-foreground">Agents</span>
                  <span className="text-xs font-body text-muted-foreground">
                    {currentUsage.agents} / {currentPlan.limits.agents}
                  </span>
                </div>
                <Progress value={(currentUsage.agents / currentPlan.limits.agents) * 100} className="h-2" />
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  {currentPlan.limits.agents - currentUsage.agents} agent slots remaining
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-body text-foreground">Listings</span>
                  <span className="text-xs font-body text-muted-foreground">
                    {currentUsage.listings} / {currentPlan.limits.listings}
                  </span>
                </div>
                <Progress value={(currentUsage.listings / currentPlan.limits.listings) * 100} className="h-2" />
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  {currentPlan.limits.listings - currentUsage.listings} listing slots remaining
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-body text-muted-foreground">Next billing date</p>
                <p className="font-body font-semibold text-foreground text-sm">April 26, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-body text-muted-foreground">Monthly charge</p>
                <p className="font-display font-bold text-foreground text-lg">{currentPlan.price}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <h2 className="font-display font-bold text-lg text-foreground mb-4">Available Plans</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.current ? "border-accent border-2 shadow-lg" : "hover:shadow-md transition-shadow"}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground text-[10px] px-3">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">{plan.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-body">{plan.description}</p>
              <div className="mt-2">
                <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground font-body">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="text-sm font-body text-foreground flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>
              {plan.current ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.price > (currentPlan?.price || "") ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Mar 26, 2026", amount: "₦75,000", status: "Paid", plan: "Agency Professional" },
              { date: "Feb 26, 2026", amount: "₦75,000", status: "Paid", plan: "Agency Professional" },
              { date: "Jan 26, 2026", amount: "₦75,000", status: "Paid", plan: "Agency Professional" },
              { date: "Dec 26, 2025", amount: "₦25,000", status: "Paid", plan: "Agency Starter" },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-body font-medium text-foreground">{inv.plan}</p>
                  <p className="text-xs text-muted-foreground font-body">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-bold text-foreground">{inv.amount}</span>
                  <Badge variant="default" className="text-[10px]">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgencyBilling;
