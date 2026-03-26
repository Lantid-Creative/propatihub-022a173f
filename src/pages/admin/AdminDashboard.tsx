import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ properties: 0, users: 0, agents: 0, inquiries: 0 });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [props, users, agents, inquiries, latestProps, latestInqs] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("agent_profiles").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id, title, city, state, price, status, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("inquiries").select("id, message, status, created_at, properties(title)").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        properties: props.count || 0,
        users: users.count || 0,
        agents: agents.count || 0,
        inquiries: inquiries.count || 0,
      });
      setRecentProperties(latestProps.data || []);
      setRecentInquiries(latestInqs.data || []);
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: "Total Properties", value: stats.properties, icon: Building2, color: "text-accent" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Agents", value: stats.agents, icon: CheckCircle, color: "text-primary" },
    { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-destructive" },
  ];

  const fmt = (p: number) => `₦${p.toLocaleString()}`;

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Properties</CardTitle>
            <Link to="/admin/properties" className="text-xs text-accent font-body hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentProperties.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">No properties yet.</p>
            ) : (
              <div className="space-y-3">
                {recentProperties.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground font-body">{p.city}, {p.state} · {fmt(p.price)}</p>
                    </div>
                    <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Inquiries</CardTitle>
            <Link to="/admin/inquiries" className="text-xs text-accent font-body hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">No inquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-foreground truncate">
                        {(inq.properties as any)?.title || "Property"}
                      </p>
                      <p className="text-xs text-muted-foreground font-body line-clamp-1">{inq.message}</p>
                    </div>
                    <Badge variant={inq.status === "pending" ? "secondary" : "default"}>{inq.status}</Badge>
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

export default AdminDashboard;
