import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MessageSquare, Eye, TrendingUp } from "lucide-react";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, inquiries: 0, views: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [props, inqs] = await Promise.all([
        supabase.from("properties").select("id, views_count").eq("agent_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("agent_id", user.id),
      ]);
      const totalViews = (props.data || []).reduce((s, p) => s + (p.views_count || 0), 0);
      setStats({ listings: props.data?.length || 0, inquiries: inqs.count || 0, views: totalViews });
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your listings and leads</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "My Listings", value: stats.listings, icon: Building2 },
          { label: "Inquiries", value: stats.inquiries, icon: MessageSquare },
          { label: "Total Views", value: stats.views, icon: Eye },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <s.icon className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/agent/properties" className="block p-3 rounded-lg bg-muted hover:bg-accent/10 font-body text-sm text-foreground transition-colors">
            📋 Manage my listings
          </a>
          <a href="/agent/inquiries" className="block p-3 rounded-lg bg-muted hover:bg-accent/10 font-body text-sm text-foreground transition-colors">
            💬 View inquiries
          </a>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgentDashboard;
