import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Eye, Users, Building2, MessageSquare, MapPin, Home, Globe, Clock, Monitor } from "lucide-react";
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

const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 };

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalViews: 0, totalUsers: 0, totalListings: 0, totalInquiries: 0, totalAgents: 0, totalAgencies: 0 });
  const [typeData, setTypeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [listingTypeData, setListingTypeData] = useState<any[]>([]);
  const [inquiryStatusData, setInquiryStatusData] = useState<any[]>([]);
  
  // Visit tracking state
  const [visitStats, setVisitStats] = useState({ totalPageViews: 0, uniqueVisitors: 0, totalSessions: 0, avgPagesPerSession: 0 });
  const [dailyViews, setDailyViews] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  
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

      const typeCounts: Record<string, number> = {};
      properties.forEach((p) => { typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
      setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      const listingCounts: Record<string, number> = {};
      properties.forEach((p) => { listingCounts[p.listing_type] = (listingCounts[p.listing_type] || 0) + 1; });
      setListingTypeData(Object.entries(listingCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      const statusCounts: Record<string, number> = {};
      properties.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      const stateCounts: Record<string, number> = {};
      properties.forEach((p) => { stateCounts[p.state] = (stateCounts[p.state] || 0) + 1; });
      setStateData(
        Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
      );

      const inqStatusCounts: Record<string, number> = {};
      (inqFullRes.data || []).forEach((i: any) => { inqStatusCounts[i.status] = (inqStatusCounts[i.status] || 0) + 1; });
      setInquiryStatusData(Object.entries(inqStatusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Fetch visit/visitor data
  useEffect(() => {
    const fetchVisitData = async () => {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString();

      const { data: views } = await supabase
        .from("page_views" as any)
        .select("visitor_id, session_id, page_path, screen_width, created_at")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: true });

      const rows = (views || []) as any[];

      // Stats
      const uniqueVisitors = new Set(rows.map(r => r.visitor_id)).size;
      const uniqueSessions = new Set(rows.map(r => r.session_id)).size;
      const avgPages = uniqueSessions > 0 ? Math.round((rows.length / uniqueSessions) * 10) / 10 : 0;

      setVisitStats({
        totalPageViews: rows.length,
        uniqueVisitors,
        totalSessions: uniqueSessions,
        avgPagesPerSession: avgPages,
      });

      // Daily views
      const dailyMap: Record<string, { views: number; visitors: Set<string> }> = {};
      rows.forEach(r => {
        const day = r.created_at.slice(0, 10);
        if (!dailyMap[day]) dailyMap[day] = { views: 0, visitors: new Set() };
        dailyMap[day].views++;
        dailyMap[day].visitors.add(r.visitor_id);
      });
      
      // Fill in missing days
      const dailyArr: any[] = [];
      const cursor = new Date(since);
      const today = new Date();
      while (cursor <= today) {
        const key = cursor.toISOString().slice(0, 10);
        const entry = dailyMap[key];
        dailyArr.push({
          date: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          views: entry?.views || 0,
          visitors: entry?.visitors.size || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      setDailyViews(dailyArr);

      // Top pages
      const pageCounts: Record<string, number> = {};
      rows.forEach(r => { pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1; });
      setTopPages(
        Object.entries(pageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([page, views]) => ({ page, views }))
      );

      // Device breakdown
      let mobile = 0, tablet = 0, desktop = 0;
      rows.forEach(r => {
        const w = r.screen_width || 0;
        if (w < 768) mobile++;
        else if (w < 1024) tablet++;
        else desktop++;
      });
      setDeviceData([
        { name: "Desktop", value: desktop },
        { name: "Tablet", value: tablet },
        { name: "Mobile", value: mobile },
      ].filter(d => d.value > 0));
    };

    fetchVisitData();
  }, [timeRange]);

  const statCards = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Listings", value: stats.totalListings.toLocaleString(), icon: Building2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Inquiries", value: stats.totalInquiries.toLocaleString(), icon: MessageSquare, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Agents", value: stats.totalAgents.toLocaleString(), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Agencies", value: stats.totalAgencies.toLocaleString(), icon: Home, color: "text-accent", bg: "bg-accent/10" },
  ];

  const visitCards = [
    { label: "Page Views", value: visitStats.totalPageViews.toLocaleString(), icon: Eye, color: "text-accent", bg: "bg-accent/10" },
    { label: "Unique Visitors", value: visitStats.uniqueVisitors.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Sessions", value: visitStats.totalSessions.toLocaleString(), icon: Clock, color: "text-accent", bg: "bg-accent/10" },
    { label: "Pages / Session", value: visitStats.avgPagesPerSession.toString(), icon: Globe, color: "text-destructive", bg: "bg-destructive/10" },
  ];

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

      <Tabs defaultValue="traffic" className="mb-8">
        <TabsList>
          <TabsTrigger value="traffic">Traffic & Visitors</TabsTrigger>
          <TabsTrigger value="platform">Platform Data</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-6 mt-4">
          {/* Time range selector */}
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>

          {/* Visit stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {visitCards.map((s) => (
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

          {/* Daily views chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" /> Daily Page Views & Visitors
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {dailyViews.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={Math.max(Math.floor(dailyViews.length / 8), 0)} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="views" name="Page Views" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground font-body text-sm">No traffic data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topPages.length > 0 ? (
                  <div className="space-y-3">
                    {topPages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}</span>
                          <span className="text-sm font-body text-foreground truncate">{p.page}</span>
                        </div>
                        <span className="text-sm font-display font-bold text-accent ml-2">{p.views}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-body text-sm text-center py-8">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Device breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-accent" /> Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
        </TabsContent>

        <TabsContent value="platform" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
