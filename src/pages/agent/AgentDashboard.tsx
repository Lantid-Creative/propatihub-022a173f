import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MessageSquare, Eye, TrendingUp, Plus, ArrowRight, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

const AgentDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ listings: 0, active: 0, inquiries: 0, pendingInq: 0, views: 0 });
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [agentProfile, setAgentProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [propsRes, inqRes, inqPendingRes, agProfileRes, recentPropsRes, recentInqRes] = await Promise.all([
        supabase.from("properties").select("id, views_count, status").eq("agent_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("agent_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("agent_id", user.id).eq("status", "pending"),
        supabase.from("agent_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("properties").select("id, title, city, state, price, status, views_count, created_at").eq("agent_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("inquiries").select("id, message, status, created_at, properties(title, city)").eq("agent_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);
      const activeCount = properties.filter((p) => p.status === "active").length;

      setStats({
        listings: properties.length,
        active: activeCount,
        inquiries: inqRes.count || 0,
        pendingInq: inqPendingRes.count || 0,
        views: totalViews,
      });

      setAgentProfile(agProfileRes.data);
      setRecentListings(recentPropsRes.data || []);
      setRecentInquiries(recentInqRes.data || []);
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
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Agent"} 👋
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Here's an overview of your listing performance
        </p>
      </div>

      {/* Verification Banner */}
      {agentProfile && !agentProfile.verified && (
        <div className="mb-6 bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-medium text-foreground">Your agent profile is pending verification</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">Complete your profile to get verified and gain buyer trust.</p>
          </div>
          <Link to="/agent/settings">
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
                <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.listings}</p>
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
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Total Views</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">{stats.views.toLocaleString()}</p>
                <p className="text-xs font-body text-muted-foreground mt-1">across all listings</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
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
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">Performance</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">
                  {stats.listings > 0 ? Math.round(stats.views / stats.listings) : 0}
                </p>
                <p className="text-xs font-body text-muted-foreground mt-1">avg views / listing</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/agent/properties">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add New Listing</Button>
        </Link>
        <Link to="/agent/inquiries">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            View Inquiries
            {stats.pendingInq > 0 && (
              <Badge className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5">{stats.pendingInq}</Badge>
            )}
          </Button>
        </Link>
        <Link to="/agent/analytics">
          <Button variant="outline" className="gap-2"><TrendingUp className="w-4 h-4" /> Analytics</Button>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Listings</CardTitle>
            <Link to="/agent/properties" className="text-xs text-accent font-body hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body text-sm">No listings yet</p>
                <Link to="/agent/properties">
                  <Button size="sm" className="mt-3 gap-2"><Plus className="w-3 h-3" /> Create First Listing</Button>
                </Link>
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

        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Inquiries</CardTitle>
            <Link to="/agent/inquiries" className="text-xs text-accent font-body hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body text-sm">No inquiries yet</p>
                <p className="text-xs text-muted-foreground font-body mt-1">Inquiries from buyers will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="font-body text-sm font-medium text-foreground truncate">
                        {(inq.properties as any)?.title || "Property"}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={inq.status === "pending" ? "secondary" : "default"} className="text-[10px]">{inq.status}</Badge>
                        <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {timeAgo(inq.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-body line-clamp-1">{inq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
