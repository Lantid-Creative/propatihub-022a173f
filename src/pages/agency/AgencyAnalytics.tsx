import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Building2, Users, MessageSquare, TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "#f59e0b", "#10b981"];

const AgencyAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ views: 0, properties: 0, agents: 0, inquiries: 0, avgPrice: 0, totalValue: 0 });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [priceByCity, setPriceByCity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("id").eq("owner_id", user.id).single();
      if (!ag) return;

      const [propsRes, agentsRes, agentProfilesRes] = await Promise.all([
        supabase.from("properties").select("*").eq("agency_id", ag.id),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }).eq("agency_id", ag.id),
        supabase.from("agent_profiles").select("*").eq("agency_id", ag.id),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);
      const totalValue = properties.reduce((s, p) => s + p.price, 0);
      const avgPrice = properties.length > 0 ? Math.round(totalValue / properties.length) : 0;

      // Count inquiries
      const propIds = properties.map((p) => p.id);
      let inqCount = 0;
      if (propIds.length > 0) {
        const { count } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).in("property_id", propIds);
        inqCount = count || 0;
      }

      setStats({
        views: totalViews,
        properties: properties.length,
        agents: agentsRes.count || 0,
        inquiries: inqCount,
        avgPrice,
        totalValue,
      });

      // Status breakdown
      const sc: Record<string, number> = {};
      properties.forEach((p) => { sc[p.status] = (sc[p.status] || 0) + 1; });
      setStatusData(Object.entries(sc).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // City breakdown
      const cc: Record<string, { count: number; totalPrice: number; views: number }> = {};
      properties.forEach((p) => {
        if (!cc[p.city]) cc[p.city] = { count: 0, totalPrice: 0, views: 0 };
        cc[p.city].count++;
        cc[p.city].totalPrice += p.price;
        cc[p.city].views += p.views_count || 0;
      });
      setCityData(Object.entries(cc).sort((a, b) => b[1].count - a[1].count).slice(0, 8).map(([name, d]) => ({ name, listings: d.count, views: d.views })));
      setPriceByCity(Object.entries(cc).sort((a, b) => b[1].count - a[1].count).slice(0, 8).map(([name, d]) => ({ name, avgPrice: Math.round(d.totalPrice / d.count) })));

      // Property type breakdown
      const tc: Record<string, number> = {};
      properties.forEach((p) => { tc[p.property_type] = (tc[p.property_type] || 0) + 1; });
      setTypeData(Object.entries(tc).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      // Agent performance
      const agentProfiles = agentProfilesRes.data || [];
      if (agentProfiles.length > 0) {
        const profileIds = agentProfiles.map((a) => a.user_id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", profileIds);
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p) => { nameMap[p.user_id] = p.full_name || "Agent"; });

        const agentListings: Record<string, { listings: number; views: number }> = {};
        properties.forEach((p) => {
          if (!agentListings[p.agent_id]) agentListings[p.agent_id] = { listings: 0, views: 0 };
          agentListings[p.agent_id].listings++;
          agentListings[p.agent_id].views += p.views_count || 0;
        });

        const perf = agentProfiles
          .map((a) => ({
            name: (nameMap[a.user_id] || "Agent").split(" ")[0],
            listings: agentListings[a.user_id]?.listings || 0,
            views: agentListings[a.user_id]?.views || 0,
          }))
          .sort((a, b) => b.listings - a.listings)
          .slice(0, 8);
        setAgentPerformance(perf);
      }
    };
    fetch();
  }, [user]);

  const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
    return `₦${n}`;
  };

  const statCards = [
    { label: "Total Properties", value: stats.properties.toLocaleString(), icon: Building2, color: "bg-accent/10 text-accent" },
    { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye, color: "bg-primary/10 text-primary" },
    { label: "Team Members", value: stats.agents.toLocaleString(), icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Inquiries", value: stats.inquiries.toLocaleString(), icon: MessageSquare, color: "bg-destructive/10 text-destructive" },
    { label: "Avg. Price", value: fmtShort(stats.avgPrice), icon: DollarSign, color: "bg-accent/10 text-accent" },
    { label: "Portfolio Value", value: fmtShort(stats.totalValue), icon: TrendingUp, color: "bg-primary/10 text-primary" },
  ];

  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Comprehensive performance overview for your agency</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Properties by City</CardTitle></CardHeader>
          <CardContent className="h-72">
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="listings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Listings" />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Views" />
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
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
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

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Agent Performance</CardTitle></CardHeader>
          <CardContent className="h-72">
            {agentPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="listings" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Listings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground font-body text-sm">No agent data yet</p>
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
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
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

      {/* Avg Price by City */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Average Price by City</CardTitle></CardHeader>
        <CardContent className="h-72">
          {priceByCity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceByCity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => fmtShort(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtShort(v)} />
                <Area type="monotone" dataKey="avgPrice" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} name="Avg Price" />
              </AreaChart>
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

export default AgencyAnalytics;
