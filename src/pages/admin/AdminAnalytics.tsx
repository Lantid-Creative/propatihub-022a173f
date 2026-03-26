import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "hsl(142 76% 36%)"];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalViews: 0, totalUsers: 0, totalListings: 0, totalInquiries: 0 });
  const [typeData, setTypeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [propsRes, usersRes, inqRes] = await Promise.all([
        supabase.from("properties").select("property_type, status, state, views_count"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);

      setStats({
        totalViews,
        totalUsers: usersRes.count || 0,
        totalListings: properties.length,
        totalInquiries: inqRes.count || 0,
      });

      // Property type distribution
      const typeCounts: Record<string, number> = {};
      properties.forEach((p) => { typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
      setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Status distribution
      const statusCounts: Record<string, number> = {};
      properties.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Top states
      const stateCounts: Record<string, number> = {};
      properties.forEach((p) => { stateCounts[p.state] = (stateCounts[p.state] || 0) + 1; });
      setStateData(
        Object.entries(stateCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }))
      );
    };
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, change: "" },
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, change: "" },
    { label: "Total Listings", value: stats.totalListings.toLocaleString(), icon: BarChart3, change: "" },
    { label: "Total Inquiries", value: stats.totalInquiries.toLocaleString(), icon: TrendingUp, change: "" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-body text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Properties by State</CardTitle></CardHeader>
          <CardContent className="h-72">
            {stateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData}>
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
          <CardHeader><CardTitle className="text-lg">Property Types</CardTitle></CardHeader>
          <CardContent className="h-72">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

      <Card>
        <CardHeader><CardTitle className="text-lg">Listing Status Breakdown</CardTitle></CardHeader>
        <CardContent className="h-64">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground font-body text-sm">No data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
