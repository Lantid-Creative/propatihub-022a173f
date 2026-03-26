import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MessageSquare, Eye, TrendingUp, ArrowRight, Clock, Settings, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

const AgencyDashboard = () => {
  const { user, profile } = useAuth();
  const [agency, setAgency] = useState<any>(null);
  const [stats, setStats] = useState({ properties: 0, active: 0, agents: 0, inquiries: 0, pendingInq: 0, views: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const { data: ag } = await supabase.from("agencies").select("*").eq("owner_id", user.id).single();
      setAgency(ag);
      if (!ag) return;

      const [propsRes, agentsRes, recentPropsRes, agentProfilesRes] = await Promise.all([
        supabase.from("properties").select("id, title, city, state, price, status, views_count, created_at, agent_id").eq("agency_id", ag.id),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }).eq("agency_id", ag.id),
        supabase.from("properties").select("id, title, city, state, price, status, views_count, created_at").eq("agency_id", ag.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("agent_profiles").select("*, profiles(full_name, avatar_url)").eq("agency_id", ag.id).order("created_at", { ascending: false }),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);
      const activeCount = properties.filter((p) => p.status === "active").length;

      // Count inquiries for agency properties
      const propIds = properties.map((p) => p.id);
      let inqCount = 0;
      let pendingInqCount = 0;
      if (propIds.length > 0) {
        const [allInq, pendInq] = await Promise.all([
          supabase.from("inquiries").select("id", { count: "exact", head: true }).in("property_id", propIds),
          supabase.from("inquiries").select("id", { count: "exact", head: true }).in("property_id", propIds).eq("status", "pending"),
        ]);
        inqCount = allInq.count || 0;
        pendingInqCount = pendInq.count || 0;
      }

      setStats({
        properties: properties.length,
        active: activeCount,
        agents: agentsRes.count || 0,
        inquiries: inqCount,
        pendingInq: pendingInqCount,
        views: totalViews,
      });

      setRecentListings(recentPropsRes.data || []);

      const agents = agentProfilesRes.data || [];
      setRecentAgents(agents.slice(0, 5));

      // Top performers by listings count
      const agentListingCount: Record<string, number> = {};
      properties.forEach((p) => {
        agentListingCount[p.agent_id] = (agentListingCount[p.agent_id] || 0) + 1;
      });
      const top = agents
        .map((a: any) => ({ ...a, listingCount: agentListingCount[a.user_id] || 0 }))
        .sort((a: any, b: any) => b.listingCount - a.listingCount)
        .slice(0, 3);
      setTopPerformers(top);
    };
    fetchAll();
  }, [user]);

  const fmt = (p: number) => `₦${p.toLocaleString()}`;
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {agency?.name || "Agency"} Dashboard 🏢
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Manage your agency operations and monitor team performance
        </p>
      </div>

      {/* No Agency Banner */}
      {!agency && (
        <div className="mb-6 bg-accent/10 border border-accent/30 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="font-body text-sm font-medium text-foreground mb-1">You haven't set up your agency profile yet</p>
          <p className="text-xs text-muted-foreground font-body mb-4">Create your agency profile to start managing listings and agents.</p>
          <Link to="/agency/settings">
            <Button className="gap-2"><Settings className="w-4 h-4" /> Set Up Agency</Button>
          </Link>
        </div>
      )}

      {agency && (
        <>
          {/* Verification Banner */}
          {!agency.verified && (
            <div className="mb-6 bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-sm font-medium text-foreground">Your agency is pending verification</p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Verified agencies get higher visibility and buyer trust.</p>
              </div>
              <Link to="/agency/settings">
                <Button size="sm" variant="outline">Complete Profile</Button>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Total Listings</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.properties}</p>
                    <p className="text-xs font-body text-primary mt-1">{stats.active} active</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Team Members</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.agents}</p>
                    <p className="text-xs font-body text-muted-foreground mt-1">registered agents</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Inquiries</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.inquiries}</p>
                    {stats.pendingInq > 0 && (
                      <p className="text-xs font-body text-accent font-medium mt-1">{stats.pendingInq} pending</p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Total Views</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.views.toLocaleString()}</p>
                    <p className="text-xs font-body text-muted-foreground mt-1">
                      {stats.properties > 0 ? `~${Math.round(stats.views / stats.properties)} avg` : "—"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/agency/properties">
              <Button className="gap-2"><Building2 className="w-4 h-4" /> View All Listings</Button>
            </Link>
            <Link to="/agency/agents">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" /> Manage Team
                {stats.agents > 0 && <Badge className="ml-1 text-xs px-1.5">{stats.agents}</Badge>}
              </Button>
            </Link>
            <Link to="/agency/analytics">
              <Button variant="outline" className="gap-2"><TrendingUp className="w-4 h-4" /> Analytics</Button>
            </Link>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Recent Listings</CardTitle>
                <Link to="/agency/properties" className="text-xs text-accent font-body hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentListings.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-body text-sm">No listings yet</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Your agents' listings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentListings.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm font-medium text-foreground truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground font-body">
                            {p.city}, {p.state} · {fmt(p.price)} · <Eye className="w-3 h-3 inline" /> {p.views_count || 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`text-[10px] ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                          <span className="text-[10px] text-muted-foreground font-body">{timeAgo(p.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Top Performers</CardTitle>
                <Link to="/agency/agents" className="text-xs text-accent font-body hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {topPerformers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-body text-sm">No agents yet</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Agents who join your agency will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topPerformers.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <span className="text-accent font-display font-bold text-xs">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-foreground truncate">
                            {(a.profiles as any)?.full_name || "Agent"}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">
                            {a.specialization || "General"} · {a.listingCount} listings
                          </p>
                        </div>
                        <Badge variant={a.verified ? "default" : "secondary"} className="text-[10px]">
                          {a.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AgencyDashboard;
