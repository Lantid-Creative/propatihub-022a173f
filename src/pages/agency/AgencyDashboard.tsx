import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MessageSquare, Eye } from "lucide-react";

const AgencyDashboard = () => {
  const { user } = useAuth();
  const [agency, setAgency] = useState<any>(null);
  const [stats, setStats] = useState({ properties: 0, agents: 0, inquiries: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("*").eq("owner_id", user.id).single();
      setAgency(ag);
      if (ag) {
        const [props, agents] = await Promise.all([
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("agency_id", ag.id),
          supabase.from("agent_profiles").select("id", { count: "exact", head: true }).eq("agency_id", ag.id),
        ]);
        setStats({ properties: props.count || 0, agents: agents.count || 0, inquiries: 0 });
      }
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {agency?.name || "Agency"} Dashboard
        </h1>
        <p className="text-muted-foreground font-body text-sm">Manage your agency operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Listings", value: stats.properties, icon: Building2 },
          { label: "Team Members", value: stats.agents, icon: Users },
          { label: "Inquiries", value: stats.inquiries, icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <s.icon className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!agency && (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground font-body mb-2">You haven't set up your agency profile yet.</p>
            <p className="text-sm text-muted-foreground font-body">Go to Settings to create your agency profile.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AgencyDashboard;
