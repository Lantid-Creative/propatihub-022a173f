import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

const AgencyAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ views: 0, leads: 0, favorites: 0, inquiries: 0 });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("id").eq("owner_id", user.id).single();
      if (!ag) return;

      const [propsRes, agentsRes] = await Promise.all([
        supabase.from("properties").select("id, city, status, views_count").eq("agency_id", ag.id),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }).eq("agency_id", ag.id),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);

      setStats({ views: totalViews, leads: agentsRes.count || 0, favorites: 0, inquiries: 0 });

      // Status breakdown
      const sc: Record<string, number> = {};
      properties.forEach((p) => { sc[p.status] = (sc[p.status] || 0) + 1; });
      setStatusData(Object.entries(sc).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // City breakdown
      const cc: Record<string, number> = {};
      properties.forEach((p) => { cc[p.city] = (cc[p.city] || 0) + 1; });
      setCityData(Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })));
    };
    fetch();
  }, [user]);

  const statCards = [
    { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye },
    { label: "Team Members", value: stats.leads.toLocaleString(), icon: TrendingUp },
    { label: "Favourites", value: stats.favorites.toLocaleString(), icon: Heart },
    { label: "Inquiries", value: stats.inquiries.toLocaleString(), icon: MessageSquare },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Track your agency's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <s.icon className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-body text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Properties by City</CardTitle></CardHeader>
          <CardContent className="h-72">
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground font-body text-sm">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground font-body text-sm">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgencyAnalytics;
