import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageSquare, Search, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import VerificationBanner from "@/components/verification/VerificationBanner";
import type { VerificationType } from "@/types/verification";

const UserDashboard = () => {
  const { profile, user, accountType } = useAuth();
  const [stats, setStats] = useState({ favorites: 0, inquiries: 0, searches: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [favs, inqs, searches] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_searches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        favorites: favs.count || 0,
        inquiries: inqs.count || 0,
        searches: searches.count || 0,
      });
    };
    fetchData();
  }, [user]);

  const cards = [
    { label: "Favourites", value: stats.favorites, icon: Heart, href: "/dashboard/favourites" },
    { label: "Inquiries Sent", value: stats.inquiries, icon: MessageSquare, href: "/dashboard/inquiries" },
    { label: "Saved Searches", value: stats.searches, icon: Search, href: "/dashboard/searches" },
    { label: "Browse Properties", value: "→", icon: Building2, href: "/properties" },
  ];

  const verType = (accountType === "buyer" ? "customer" : accountType) as VerificationType || "customer";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <p className="text-muted-foreground font-body text-sm">Your PropatiHub dashboard</p>
      </div>

      {/* Verification Banner */}
      <VerificationBanner type={verType} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((s) => (
          <Link key={s.label} to={s.href}>
            <Card className="hover:border-accent/50 transition-colors">
              <CardContent className="p-5">
                <s.icon className="w-6 h-6 text-accent mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-xs font-body text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Getting Started</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Link to="/properties" className="block p-3 rounded-lg bg-muted hover:bg-accent/10 font-body text-sm text-foreground transition-colors">
            🏠 Browse properties across Nigeria
          </Link>
          <Link to="/dashboard/searches" className="block p-3 rounded-lg bg-muted hover:bg-accent/10 font-body text-sm text-foreground transition-colors">
            🔔 Set up property alerts
          </Link>
          <Link to="/dashboard/settings" className="block p-3 rounded-lg bg-muted hover:bg-accent/10 font-body text-sm text-foreground transition-colors">
            ⚙️ Complete your profile
          </Link>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default UserDashboard;
