import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Building2, Shield, Globe, Phone, Mail, MapPin, Save, Loader2 } from "lucide-react";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const AgencySettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    logo_url: "",
  });
  const [notifications, setNotifications] = useState({
    newInquiry: true,
    newAgent: true,
    listingExpiry: true,
    weeklyReport: false,
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("agencies").select("*").eq("owner_id", user.id).single();
      if (data) {
        setAgency(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          logo_url: data.logo_url || "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.name.trim()) {
      toast({ title: "Agency name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (agency) {
        const { error } = await supabase.from("agencies").update(form).eq("id", agency.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("agencies").insert({ ...form, owner_id: user.id }).select().single();
        if (error) throw error;
        setAgency(data);
      }
      toast({ title: agency ? "Agency profile updated" : "Agency created successfully!" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Agency Settings</h1>
          <p className="text-muted-foreground font-body text-sm">
            {agency ? "Update your agency profile and preferences" : "Set up your agency profile"}
          </p>
        </div>
        {agency?.verified && (
          <Badge className="bg-primary/10 text-primary gap-1">
            <Shield className="w-3 h-3" /> Verified
          </Badge>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Agency Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" /> Agency Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-body">Agency Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Ace Realtors Ltd" className="mt-1.5" />
            </div>

            <div>
              <Label className="font-body">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                placeholder="Tell potential clients about your agency, your specialties, and your track record..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="font-body">Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => update("logo_url", e.target.value)} placeholder="https://example.com/logo.png" className="mt-1.5" />
              <p className="text-[10px] text-muted-foreground font-body mt-1">Paste a link to your agency logo</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-accent" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body">Phone Number</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234 801 234 5678" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body">Email Address</Label>
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="info@agency.com" className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="font-body">Website</Label>
              <div className="relative mt-1.5">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://www.agency.com" className="pl-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" /> Office Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-body">Office Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Victoria Island, Lagos" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body">City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Lagos" className="mt-1.5" />
              </div>
              <div>
                <Label className="font-body">State</Label>
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "newInquiry", label: "New Inquiry Alerts", desc: "Get notified when a buyer inquires about your listings" },
              { key: "newAgent", label: "New Agent Joins", desc: "Get notified when an agent joins your agency" },
              { key: "listingExpiry", label: "Listing Expiry", desc: "Alerts when listings are about to expire" },
              { key: "weeklyReport", label: "Weekly Performance Report", desc: "Receive a weekly summary of your agency performance" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
                </div>
                <Switch
                  checked={(notifications as any)[item.key]}
                  onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[160px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : agency ? "Update Agency" : "Create Agency"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgencySettings;
