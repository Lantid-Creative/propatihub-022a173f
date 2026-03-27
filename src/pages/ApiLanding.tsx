import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Code2, Key, Shield, Zap, Database, CreditCard, ArrowRight,
  Copy, RefreshCw, Plus, Trash2, Eye, EyeOff, MapPin, Clock,
  Check, Globe, Filter, BarChart3, ExternalLink,
} from "lucide-react";

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

const features = [
  { icon: Database, title: "Real-Time Data", desc: "Access live property listings with prices, images, coordinates, and full details." },
  { icon: Filter, title: "Advanced Filters", desc: "Filter by property type, listing type, price range, bedrooms, and more." },
  { icon: Globe, title: "LGA-Based Access", desc: "Subscribe to specific Local Government Areas. Pay only for the data you need." },
  { icon: Shield, title: "Secure API Keys", desc: "Generate and manage multiple API keys with full visibility into usage." },
  { icon: Zap, title: "Fast & Reliable", desc: "Low-latency responses with paginated results up to 100 per request." },
  { icon: BarChart3, title: "Usage Analytics", desc: "Track API calls, monitor usage patterns, and manage subscriptions." },
];

const pricingFeatures = [
  "Full property data for the LGA",
  "Real-time updates as listings change",
  "Up to 100 results per request",
  "Filter by type, price, bedrooms",
  "Property images and GPS coordinates",
  "30-day access per subscription",
  "Multiple API keys supported",
  "Detailed usage logs",
];

const BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/property-api`;

const ApiLanding = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const isEligible = user && (hasRole("agent") || hasRole("agency") || hasRole("admin"));

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const fetchData = async () => {
    if (!user || !isEligible) return;
    setLoading(true);
    const [keysRes, subsRes] = await Promise.all([
      supabase.from("api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("api_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setApiKeys((keysRes.data as any[]) || []);
    setSubscriptions((subsRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, isEligible]);

  const generateApiKey = async () => {
    if (!user) return;
    const { error } = await supabase.from("api_keys").insert({ user_id: user.id, name: `Key ${apiKeys.length + 1}` } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key generated!" });
      fetchData();
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key deleted" });
      fetchData();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard!" });
  };

  const subscribeLga = async () => {
    if (!user || !selectedState || !selectedLga) return;
    setSubscribing(true);
    const existing = subscriptions.find(
      (s) => s.lga === selectedLga && s.state === selectedState && s.status === "active" && new Date(s.expires_at) > new Date()
    );
    if (existing) {
      toast({ title: "Already subscribed", description: `Active subscription for ${selectedLga}, ${selectedState}`, variant: "destructive" });
      setSubscribing(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("paystack-payment/initialize", {
        body: {
          email: user.email,
          amount: 10000,
          payment_type: "api_subscription",
          metadata: { user_id: user.id, state: selectedState, lga: selectedLga, callback_url: `${window.location.origin}/payment/callback` },
        },
      });
      if (error || !data?.authorization_url) {
        toast({ title: "Payment Error", description: "Could not initialize payment.", variant: "destructive" });
        return;
      }
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Property Data API | PropatiHub"
        description="Access real-time Nigerian property data programmatically. Subscribe per LGA, generate API keys, and integrate PropatiHub listings into your apps."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider">
            Developer API
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
            Nigerian Property Data,<br className="hidden sm:block" /> One API Call Away
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto mb-8">
            Access real-time property listings, prices, images, and coordinates for any Local Government Area in Nigeria. Built for agents, agencies, and developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isEligible ? (
              <Button size="lg" onClick={() => document.getElementById("manage")?.scrollIntoView({ behavior: "smooth" })}>
                <Key className="w-4 h-4 mr-2" /> Manage API Keys
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link to="/auth">Get Started Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to="/api-docs"><Code2 className="w-4 h-4 mr-2" /> Read the Docs</Link>
            </Button>
          </div>

          {/* Code preview */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="rounded-xl overflow-hidden border border-border shadow-lg text-left">
              <div className="bg-foreground/95 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-mono text-muted/60 ml-2">Terminal</span>
              </div>
              <pre className="bg-foreground/90 p-5 overflow-x-auto text-sm leading-relaxed">
                <code className="text-primary-foreground font-mono">
                  <span className="text-green-400">$</span>{" "}
                  <span className="text-blue-300">curl</span>{" "}
                  <span className="text-yellow-300">"{BASE_URL}/properties?lga=Ikeja&state=Lagos"</span>{" "}
                  \{"\n"}
                  {"  "}-H <span className="text-yellow-300">"x-api-key: pk_your_key_here"</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Everything You Need to Build
            </h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Powerful, well-documented endpoints with flexible filtering and reliable uptime.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-border hover:border-primary/20 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background" id="pricing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground font-body">Pay per LGA. No hidden fees. Cancel anytime.</p>
          </div>
          <Card className="border-primary/20 shadow-xl max-w-lg mx-auto overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
              <p className="text-primary-foreground/80 font-body text-sm uppercase tracking-wider mb-1">Per LGA / Per Month</p>
              <p className="text-5xl font-display font-bold text-primary-foreground">₦10,000</p>
            </div>
            <CardContent className="p-8">
              <ul className="space-y-3 mb-8">
                {pricingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-body text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {isEligible ? (
                <Button className="w-full" size="lg" onClick={() => document.getElementById("manage")?.scrollIntoView({ behavior: "smooth" })}>
                  Subscribe to an LGA <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link to="/auth">Sign Up as Agent / Agency <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Management Section (for authenticated agents/agencies) */}
      {isEligible && (
        <section className="py-20 px-6" id="manage">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                Manage Your API
              </h2>
              <p className="text-muted-foreground font-body">Generate keys, subscribe to LGAs, and monitor access.</p>
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
                          <code className="text-xs font-mono text-foreground truncate block">
                            {showKey[key.id] ? key.api_key : key.api_key.slice(0, 8) + "••••••••••••••••"}
                          </code>
                          {key.last_used_at && (
                            <p className="text-xs text-muted-foreground mt-1">Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
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
                <p className="text-sm text-muted-foreground font-body">₦10,000/month per LGA — via Paystack</p>
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
                          <p className="text-xs text-muted-foreground font-body">{isActive ? `${daysLeft} days remaining` : "Expired"}</p>
                          <p className="text-xs text-muted-foreground font-body">₦{(sub.amount || 10000).toLocaleString()}/month</p>
                          {!isActive && (
                            <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => { setSelectedState(sub.state); setSelectedLga(sub.lga); }}>
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
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-4">
            Ready to integrate Nigerian property data?
          </h2>
          <p className="text-primary-foreground/80 font-body mb-8 max-w-xl mx-auto">
            Sign up as an agent or agency, generate your API key, and start pulling listings in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/api-docs"><Code2 className="w-4 h-4 mr-2" /> View Full Documentation</Link>
            </Button>
            {!isEligible && (
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/auth">Create Account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiLanding;
