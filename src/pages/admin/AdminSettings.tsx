import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground font-body text-sm">Configure PropatiHub</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-lg">General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1.5">Platform Name</label>
              <Input defaultValue="PropatiHub" />
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1.5">Support Email</label>
              <Input defaultValue="support@propatihub.ng" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Features</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email Notifications", desc: "Send email alerts for new listings" },
              { label: "Agent Verification Required", desc: "Require admin approval for new agents" },
              { label: "Property Moderation", desc: "Review properties before they go live" },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{f.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button>Save Settings</Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
