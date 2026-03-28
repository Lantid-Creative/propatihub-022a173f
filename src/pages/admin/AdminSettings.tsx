import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Globe, Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings saved successfully ✓" });
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground font-body text-sm">Configure PropatiHub platform</p>
      </div>

      <Tabs defaultValue="general" className="max-w-3xl">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm"><Globe className="w-3.5 h-3.5" /> General</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 text-xs sm:text-sm"><Settings className="w-3.5 h-3.5" /> Features</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm"><Bell className="w-3.5 h-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Information</CardTitle>
                <CardDescription className="font-body">Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Platform Name</label>
                  <Input defaultValue="PropatiHub" />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Support Email</label>
                  <Input defaultValue="support@propatihub.ng" />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Support Phone</label>
                  <Input defaultValue="+234 800 000 0000" />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Website URL</label>
                  <Input defaultValue="https://propatihub.ng" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO & Metadata</CardTitle>
                <CardDescription className="font-body">Search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Meta Title</label>
                  <Input defaultValue="PropatiHub - Nigeria's Premier Property Platform" />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Meta Description</label>
                  <Input defaultValue="Find properties for sale and rent across Nigeria. Connect with verified agents and agencies." />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Toggles</CardTitle>
              <CardDescription className="font-body">Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Property Moderation", desc: "Review and approve properties before they go live", default: true },
                { label: "Agent Verification Required", desc: "Require admin approval before agents can list properties", default: true },
                { label: "Agency Verification Required", desc: "Require admin approval for new agencies", default: true },
                { label: "Allow Property Comparisons", desc: "Users can compare up to 3 properties side by side", default: false },
                { label: "Enable Mortgage Calculator", desc: "Show mortgage calculator on property pages", default: true },
                { label: "Enable Property Valuation", desc: "Allow users to request property valuations", default: true },
                { label: "Featured Listings", desc: "Allow agents to pay for featured placement", default: false },
                { label: "User Reviews", desc: "Allow users to review agents and agencies", default: false },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{f.desc}</p>
                  </div>
                  <Switch defaultChecked={f.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription className="font-body">Control what notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "New User Registration", desc: "Email admin when a new user signs up", default: true },
                { label: "New Property Listed", desc: "Email admin when a new property is submitted", default: true },
                { label: "New Inquiry", desc: "Email agents when they receive a new inquiry", default: true },
                { label: "Agent Verification Request", desc: "Email admin when a new agent registers", default: true },
                { label: "Property Status Change", desc: "Email agent when property status changes", default: true },
                { label: "Weekly Analytics Report", desc: "Send weekly platform analytics to admin", default: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Settings</CardTitle>
              <CardDescription className="font-body">Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts", default: false },
                { label: "Rate Limiting", desc: "Limit API requests per user", default: true },
                { label: "IP Whitelisting", desc: "Restrict admin access to specific IPs", default: false },
                { label: "Session Timeout", desc: "Auto logout after 30 minutes of inactivity", default: true },
                { label: "Audit Logging", desc: "Log all admin actions for compliance", default: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-body font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 max-w-3xl">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
