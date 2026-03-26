import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users, Building2, MessageSquare, MapPin, Home } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from "recharts";

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "hsl(152, 30%, 40%)",
];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalViews: 0, totalUsers: 0, totalListings: 0, totalInquiries: 0, totalAgents: 0, totalAgencies: 0 });
  const [typeData, setTypeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [listingTypeData, setListingTypeData] = useState<any[]>([]);
  const [inquiryStatusData, setInquiryStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [propsRes, usersRes, inqRes, agentsRes, agenciesRes, inqFullRes] = await Promise.all([
        supabase.from("properties").select("property_type, listing_type, status, state, views_count"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }),
        supabase.from("agencies").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("status"),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);

      setStats({
        totalViews,
        totalUsers: usersRes.count || 0,
        totalListings: properties.length,
        totalInquiries: inqRes.count || 0,
        totalAgents: agentsRes.count || 0,
        totalAgencies: agenciesRes.count || 0,
      });

      // Property type
      const typeCounts: Record<string, number> = {};
      properties.forEach((p) => { typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
      setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Listing type
      const listingCounts: Record<string, number> = {};
      properties.forEach((p) => { listingCounts[p.listing_type] = (listingCounts[p.listing_type] || 0) + 1; });
      setListingTypeData(Object.entries(listingCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Status
      const statusCounts: Record<string, number> = {};
      properties.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // States
      const stateCounts: Record<string, number> = {};
      properties.forEach((p) => { stateCounts[p.state] = (stateCounts[p.state] || 0) + 1; });
      setStateData(
        Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
      );

      // Inquiry statuses
      const inqStatusCounts: Record<string, number> = {};
      (inqFullRes.data || []).forEach((i: any) => { inqStatusCounts[i.status] = (inqStatusCounts[i.status] || 0) + 1; });
      setInquiryStatusData(Object.entries(inqStatusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Listings", value: stats.totalListings.toLocaleString(), icon: Building2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Inquiries", value: stats.totalInquiries.toLocaleString(), icon: MessageSquare, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Agents", value: stats.totalAgents.toLocaleString(), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Agencies", value: stats.totalAgencies.toLocaleString(), icon: Home, color: "text-accent", bg: "bg-accent/10" },
  ];

  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 };

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
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Comprehensive performance metrics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-body text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Properties by State */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Properties by State</CardTitle></CardHeader>
          <CardContent className="h-72">
            {stateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground font-body text-sm">No data yet</p></div>}
          </CardContent>
        </Card>

        {/* Property Types Pie */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Property Types</CardTitle></CardHeader>
          <CardContent className="h-72">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground font-body text-sm">No data yet</p></div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Listing Status */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Listing Status</CardTitle></CardHeader>
          <CardContent className="h-56">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={65} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground font-body text-sm">No data</p></div>}
          </CardContent>
        </Card>

        {/* Listing Types */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Listing Types</CardTitle></CardHeader>
          <CardContent className="h-56">
            {listingTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={listingTypeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                    {listingTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground font-body text-sm">No data</p></div>}
          </CardContent>
        </Card>

        {/* Inquiry Status */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Inquiry Status</CardTitle></CardHeader>
          <CardContent className="h-56">
            {inquiryStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inquiryStatusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                    {inquiryStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center"><p className="text-muted-foreground font-body text-sm">No data</p></div>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
