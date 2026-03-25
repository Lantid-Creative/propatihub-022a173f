import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const AgencySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agency, setAgency] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", phone: "", email: "", address: "", city: "", state: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("agencies").select("*").eq("owner_id", user.id).single().then(({ data }) => {
      if (data) {
        setAgency(data);
        setForm({ name: data.name, description: data.description || "", phone: data.phone || "", email: data.email || "", address: data.address || "", city: data.city || "", state: data.state || "" });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    if (agency) {
      await supabase.from("agencies").update(form).eq("id", agency.id);
    } else {
      await supabase.from("agencies").insert({ ...form, owner_id: user.id });
    }
    toast({ title: "Agency profile saved" });
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Settings</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your agency profile</p>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-lg">Agency Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Agency Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ace Realtors Ltd" />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">City</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">State</label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : agency ? "Update Agency" : "Create Agency"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgencySettings;
