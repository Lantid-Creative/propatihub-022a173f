import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AgentAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ views: 0, favorites: 0, inquiries: 0, listings: 0 });
  const [listingData, setListingData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [propsRes, inqRes, favRes] = await Promise.all([
        supabase.from("properties").select("id, title, views_count, status").eq("agent_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("agent_id", user.id),
        supabase.from("favorites").select("property_id, properties!inner(agent_id)").eq("properties.agent_id", user.id),
      ]);

      const properties = propsRes.data || [];
      const totalViews = properties.reduce((s, p) => s + (p.views_count || 0), 0);

      setStats({
        views: totalViews,
        favorites: favRes.data?.length || 0,
        inquiries: inqRes.count || 0,
        listings: properties.length,
      });

      // Per-listing views chart
      setListingData(
        properties
          .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
          .slice(0, 8)
          .map((p) => ({
            name: p.title.length > 20 ? p.title.slice(0, 20) + "…" : p.title,
            views: p.views_count || 0,
          }))
      );
    };
    fetch();
  }, [user]);

  const statCards = [
    { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye },
    { label: "My Listings", value: stats.listings.toLocaleString(), icon: TrendingUp },
    { label: "Favourites", value: stats.favorites.toLocaleString(), icon: Heart },
    { label: "Inquiries", value: stats.inquiries.toLocaleString(), icon: MessageSquare },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Analytics</h1>
        <p className="text-muted-foreground font-body text-sm">Track your listing performance</p>
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

      <Card>
        <CardHeader><CardTitle className="text-lg">Views by Listing</CardTitle></CardHeader>
        <CardContent className="h-72">
          {listingData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground font-body text-sm">List properties to see analytics here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AgentAnalytics;
