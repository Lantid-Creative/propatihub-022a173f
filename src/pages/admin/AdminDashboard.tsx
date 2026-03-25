import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessageSquare, TrendingUp, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ properties: 0, users: 0, agents: 0, inquiries: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [props, users, agents, inquiries] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        properties: props.count || 0,
        users: users.count || 0,
        agents: agents.count || 0,
        inquiries: inquiries.count || 0,
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Properties", value: stats.properties, icon: Building2, color: "text-accent" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Agents", value: stats.agents, icon: CheckCircle, color: "text-green-light" },
    { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground font-body text-sm">Manage PropatiHub platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Properties</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-body text-sm">Properties will appear here as they are listed on the platform.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Inquiries</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-body text-sm">Buyer and renter inquiries will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
