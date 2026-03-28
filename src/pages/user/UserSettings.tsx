import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const UserSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [state, setState] = useState(profile?.state || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, phone, city, state }).eq("user_id", user.id);
    toast({ 
      title: "Profile Updated", 
      description: "Your personal information has been saved successfully.",
      className: "bg-primary text-primary-foreground border-none",
    });
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your profile</p>
      </div>

      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Email</label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserSettings;
