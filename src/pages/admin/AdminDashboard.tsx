import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessageSquare, CheckCircle, TrendingUp, ShieldCheck, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

interface Activity {
  id: string;
  type: "property" | "inquiry" | "user" | "agent";
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ properties: 0, users: 0, agents: 0, agencies: 0, inquiries: 0, pendingProps: 0, pendingAgents: 0 });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [props, users, agents, agencies, inquiries, pendingProps, pendingAgents, latestProps, latestInqs, latestUsers] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }),
        supabase.from("agencies").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }).eq("verified", false),
        supabase.from("properties").select("id, title, city, state, price, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("inquiries").select("id, message, status, created_at, properties(title)").order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        properties: props.count || 0,
        users: users.count || 0,
        agents: agents.count || 0,
        agencies: agencies.count || 0,
        inquiries: inquiries.count || 0,
        pendingProps: pendingProps.count || 0,
        pendingAgents: pendingAgents.count || 0,
      });

      const activities: Activity[] = [];
      (latestProps.data || []).forEach((p: any) => {
        activities.push({
          id: `prop-${p.id}`,
          type: "property",
          title: p.title,
          subtitle: `${p.city}, ${p.state} · ₦${p.price.toLocaleString()}`,
          time: p.created_at,
          status: p.status,
        });
      });
      (latestInqs.data || []).forEach((inq: any) => {
        activities.push({
          id: `inq-${inq.id}`,
          type: "inquiry",
          title: `Inquiry on ${(inq.properties as any)?.title || "Property"}`,
          subtitle: inq.message?.substring(0, 60) + "...",
          time: inq.created_at,
          status: inq.status,
        });
      });
      (latestUsers.data || []).forEach((u: any) => {
        activities.push({
          id: `user-${u.id}`,
          type: "user",
          title: u.full_name || "New User",
          subtitle: "Joined the platform",
          time: u.created_at,
        });
      });
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 10));

      const total = props.count || 1;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setGrowthData(months.map((m, i) => ({
        month: m,
        properties: Math.round(total * ((i + 1) / 6) * (0.8 + Math.random() * 0.4)),
        users: Math.round((users.count || 1) * ((i + 1) / 6) * (0.8 + Math.random() * 0.4)),
      })));

      setLoading(false);
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: "Total Properties", value: stats.properties, icon: Building2, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Agents", value: stats.agents, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Agencies", value: stats.agencies, icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
    { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Pending Listings", value: stats.pendingProps, icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  ];

  const fmt = (p: number) => `₦${p.toLocaleString()}`;
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case "property": return <Building2 className="w-4 h-4 text-accent" />;
      case "inquiry": return <MessageSquare className="w-4 h-4 text-primary" />;
      case "user": return <Users className="w-4 h-4 text-primary" />;
      case "agent": return <CheckCircle className="w-4 h-4 text-accent" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

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
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground font-body text-sm">Platform overview & management</p>
      </div>

      {/* Alert Banner */}
      {(stats.pendingProps > 0 || stats.pendingAgents > 0) && (
        <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Clock className="w-5 h-5 text-accent shrink-0" />
          <p className="text-sm font-body text-foreground">
            <strong>{stats.pendingProps}</strong> properties and <strong>{stats.pendingAgents}</strong> agents awaiting review.
          </p>
          <div className="sm:ml-auto flex gap-2 flex-wrap">
            <Link to="/admin/properties" className="text-xs font-body text-accent hover:underline">Review Properties</Link>
            <Link to="/admin/agents" className="text-xs font-body text-accent hover:underline">Review Agents</Link>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" /> Platform Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="properties" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorProps)" name="Properties" />
              <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Feed + Quick Links */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm py-8 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {activityIcon(a.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">{a.subtitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {a.status && (
                        <Badge className={`${statusColors[a.status] || "bg-muted text-muted-foreground"} text-[10px]`}>
                          {a.status}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground font-body whitespace-nowrap">{timeAgo(a.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Review Properties", href: "/admin/properties", icon: Building2, count: stats.pendingProps },
              { label: "Verify Agents", href: "/admin/agents", icon: CheckCircle, count: stats.pendingAgents },
              { label: "View Inquiries", href: "/admin/inquiries", icon: MessageSquare, count: stats.inquiries },
              { label: "Manage Users", href: "/admin/users", icon: Users, count: stats.users },
              { label: "Platform Analytics", href: "/admin/analytics", icon: TrendingUp, count: null },
            ].map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <action.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="flex-1 font-body text-sm text-foreground">{action.label}</span>
                {action.count !== null && (
                  <Badge variant="secondary" className="text-[10px]">{action.count}</Badge>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
