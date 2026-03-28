import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Copy, RefreshCw, Plus, Trash2, Eye, EyeOff, MapPin, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const NIGERIAN_STATES_LGAS: Record<string, string[]> = {
  Lagos: ["Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Surulere", "Yaba", "Ajah", "Ikorodu", "Epe", "Badagry", "Agege", "Alimosho", "Apapa", "Amuwo-Odofin", "Eti-Osa", "Ifako-Ijaiye", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu"],
  Abuja: ["Wuse", "Maitama", "Garki", "Asokoro", "Gwarinpa", "Jabi", "Kubwa", "Lugbe", "Karu", "Nyanya", "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme", "Oyigbo", "Ikwerre", "Emohua", "Etche"],
  Oyo: ["Ibadan North", "Ibadan South-West", "Ibadan South-East", "Ibadan North-East", "Ibadan North-West", "Oluyole", "Akinyele"],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ifo", "Sagamu", "Obafemi-Owode"],
  Enugu: ["Enugu East", "Enugu North", "Enugu South", "Nsukka", "Udi"],
  Anambra: ["Awka North", "Awka South", "Onitsha North", "Onitsha South", "Nnewi North"],
  Delta: ["Warri South", "Uvwie", "Oshimili South", "Sapele", "Ethiope East"],
  Kaduna: ["Kaduna North", "Kaduna South", "Chikun", "Igabi", "Zaria"],
  Kano: ["Kano Municipal", "Nassarawa", "Tarauni", "Fagge", "Dala"],
};

const ApiAccess = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const isEligible = hasRole("agent") || hasRole("agency") || hasRole("admin");

  const fetchData = async () => {
    if (!user) return;
    const [keysRes, subsRes] = await Promise.all([
      supabase.from("api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("api_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setApiKeys((keysRes.data as any[]) || []);
    setSubscriptions((subsRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const generateApiKey = async () => {
    if (!user) return;
    const { error } = await supabase.from("api_keys").insert({ user_id: user.id, name: `Key ${apiKeys.length + 1}` } as any);
    if (error) {
      toast({ 
        title: "Key Generation Failed", 
        description: error.message || "We encountered an issue while generating your API key. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "API Key Generated Successfully", 
        description: "Your new API key is ready for use. Please keep it secure.",
        className: "bg-primary text-primary-foreground border-none",
      });
      fetchData();
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) {
      toast({ 
        title: "Deletion Error", 
        description: error.message || "We could not delete the API key at this time. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "API Key Revoked", 
        description: "The selected API key has been successfully deleted and can no longer be used.",
        className: "bg-primary text-primary-foreground border-none",
      });
      fetchData();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ 
      title: "Key Copied", 
      description: "API key has been copied to your clipboard.",
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  const subscribeLga = async () => {
    if (!user || !selectedState || !selectedLga) return;
    setSubscribing(true);

    // Check if already subscribed
    const existing = subscriptions.find(
      (s) => s.lga === selectedLga && s.state === selectedState && s.status === "active" && new Date(s.expires_at) > new Date()
    );
    if (existing) {
      toast({ 
        title: "Subscription Already Active", 
        description: `You already have an active subscription for ${selectedLga}, ${selectedState}.`, 
        variant: "destructive" 
      });
      setSubscribing(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("paystack-payment/initialize", {
        body: {
          email: user.email,
          amount: 10000,
          payment_type: "api_subscription",
          metadata: {
            user_id: user.id,
            state: selectedState,
            lga: selectedLga,
            callback_url: `${window.location.origin}/payment/callback`,
          },
        },
      });

      if (error || !data?.authorization_url) {
        toast({ 
          title: "Payment Initialization Failed", 
          description: "We encountered an issue while setting up your payment. Please try again or contact support.", 
          variant: "destructive" 
        });
        return;
      }

      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ 
        title: "Subscription Error", 
        description: err.message || "We encountered an unexpected error while processing your subscription. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubscribing(false);
    }
  };

  const portalPrefix = hasRole("admin") ? "/admin" : hasRole("agency") ? "/agency" : hasRole("agent") ? "/agent" : "/dashboard";

  if (!isEligible) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">API Access for Agents & Agencies</h2>
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
            The PropatiHub API is available exclusively for registered agents and agencies.
            Sign up as an agent or agency to get started.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">API Access</h1>
            <p className="text-sm text-muted-foreground font-body">
              Manage your API keys and LGA subscriptions to pull property data.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/api-docs" className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> API Docs
            </Link>
          </Button>
        </div>

        {/* API Keys */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> API Keys
            </CardTitle>
            <Button size="sm" onClick={generateApiKey}>
              <Plus className="w-3 h-3 mr-1" /> Generate Key
            </Button>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body text-center py-6">
                No API keys yet. Generate one to start using the API.
              </p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-body mb-1">{key.name}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-foreground truncate">
                          {showKey[key.id] ? key.api_key : key.api_key.slice(0, 8) + "••••••••••••••••"}
                        </code>
                      </div>
                      {key.last_used_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last used: {new Date(key.last_used_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowKey(p => ({ ...p, [key.id]: !p[key.id] }))}>
                        {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyKey(key.api_key)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteApiKey(key.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscribe to LGA */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Subscribe to LGA
            </CardTitle>
            <p className="text-sm text-muted-foreground font-body">₦10,000/month per LGA</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedLga(""); }}
              >
                <option value="">Select State</option>
                {Object.keys(NIGERIAN_STATES_LGAS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedLga}
                onChange={(e) => setSelectedLga(e.target.value)}
                disabled={!selectedState}
              >
                <option value="">Select LGA</option>
                {(NIGERIAN_STATES_LGAS[selectedState] || []).map((lga) => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
              <Button onClick={subscribeLga} disabled={!selectedState || !selectedLga || subscribing} className="shrink-0">
                {subscribing ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                Subscribe ₦10,000
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body text-center py-6">
                No subscriptions yet. Subscribe to an LGA above to start pulling property data.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((sub) => {
                  const isActive = sub.status === "active" && new Date(sub.expires_at) > new Date();
                  const daysLeft = Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                  return (
                    <div key={sub.id} className={`p-3 rounded-lg border ${isActive ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">{sub.lga}</p>
                          <p className="text-xs text-muted-foreground">{sub.state}</p>
                        </div>
                        <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {isActive ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-body">
                        {isActive ? `${daysLeft} days remaining` : "Expired"}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        ₦{(sub.amount || 10000).toLocaleString()}/month
                      </p>
                      {!isActive && (
                        <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => {
                          setSelectedState(sub.state);
                          setSelectedLga(sub.lga);
                        }}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Renew
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApiAccess;
