import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Rocket } from "lucide-react";

const TIERS = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: 0,
    priceLabel: "₦0/month",
    maxValue: 5000000,
    maxValueLabel: "₦5M",
    maxBids: 2,
    earlyAccess: false,
    features: ["Browse all listings", "2 active bids/month", "Properties up to ₦5M"],
  },
  {
    id: "basic",
    name: "Basic",
    icon: Star,
    price: 10000,
    priceLabel: "₦10,000/month",
    maxValue: 20000000,
    maxValueLabel: "₦20M",
    maxBids: 5,
    earlyAccess: false,
    features: ["5 active bids/month", "Properties up to ₦20M", "Bid history & analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    price: 50000,
    priceLabel: "₦50,000/month",
    maxValue: null,
    maxValueLabel: "Unlimited",
    maxBids: 20,
    earlyAccess: true,
    popular: true,
    features: ["20 active bids/month", "All property values", "Priority access", "Early bidding window"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Rocket,
    price: 100000,
    priceLabel: "₦100,000/month",
    maxValue: null,
    maxValueLabel: "Unlimited",
    maxBids: 999,
    earlyAccess: true,
    features: ["Unlimited bidding", "All property values", "Off-market access", "Bulk deal support", "Dedicated account manager"],
  },
];

const BidSubscriptionTiers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTier, setCurrentTier] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("bid_subscriptions")
        .select("tier, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && new Date(data.expires_at) > new Date()) {
        setCurrentTier(data.tier);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to your account to manage your bidding subscriptions.", 
        variant: "destructive" 
      });
      return;
    }
    const tier = TIERS.find((t) => t.id === tierId)!;
    if (tier.price === 0) {
      toast({ 
        title: "Standard Plan Active", 
        description: "You are already benefiting from our free-tier bidding services.",
        className: "bg-primary text-primary-foreground border-none",
      });
      return;
    }

    setSubscribing(tierId);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-payment/initialize", {
        body: {
          email: user.email,
          amount: tier.price,
          payment_type: "bid_subscription",
          metadata: {
            user_id: user.id,
            tier: tierId,
            max_property_value: tier.maxValue,
            max_active_bids: tier.maxBids,
            early_access: tier.earlyAccess,
            callback_url: `${window.location.origin}/payment/callback`,
          },
        },
      });

      if (error || !data?.authorization_url) {
        toast({ 
          title: "Payment Initialization Failed", 
          description: "We encountered an issue while setting up your subscription payment. Please try again or contact support.", 
          variant: "destructive" 
        });
        return;
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ 
        title: "Subscription Error", 
        description: err.message || "We encountered an unexpected issue while processing your subscription. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Bidding Subscription Plans
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that matches your investment level. Higher tiers unlock more bids, higher-value properties, and early access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = currentTier === tier.id;
            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? "border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/20"
                    : "border-border"
                } ${isCurrent ? "bg-accent/5" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="font-display text-lg">{tier.name}</CardTitle>
                  <p className="font-display text-2xl font-bold text-foreground">{tier.priceLabel}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    Up to {tier.maxValueLabel} property value
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isCurrent || loading || subscribing === tier.id}
                    variant={tier.popular ? "default" : "outline"}
                    className={`w-full ${tier.popular ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                  >
                    {isCurrent ? "Current Plan" : subscribing === tier.id ? "Processing..." : tier.price === 0 ? "Get Started" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BidSubscriptionTiers;
