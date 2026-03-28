import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Search, Building2, ShieldAlert, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ favorites: 0, inquiries: 0, searches: 0 });
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [favs, inqs, searches, verif] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_searches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("verification_profiles").select("status").eq("user_id", user.id).eq("verification_type", "customer").maybeSingle(),
      ]);
      setStats({
        favorites: favs.count || 0,
        inquiries: inqs.count || 0,
        searches: searches.count || 0,
      });
      setIsVerified(verif.data?.status === "approved");
    };
    fetchData();
  }, [user]);

  const cards = [
    { label: "Favourites", value: stats.favorites, icon: Heart, href: "/dashboard/favourites" },
    { label: "Inquiries Sent", value: stats.inquiries, icon: MessageSquare, href: "/dashboard/inquiries" },
    { label: "Saved Searches", value: stats.searches, icon: Search, href: "/dashboard/searches" },
    { label: "Browse Properties", value: "→", icon: Building2, href: "/properties" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <p className="text-muted-foreground font-body text-sm">Your PropatiHub dashboard</p>
      </div>

      {/* Verification Banner */}
      {isVerified === false && (
        <Card className="mb-6 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-foreground">Complete Identity Verification</p>
                <p className="font-body text-xs text-muted-foreground">Verify your identity to unlock bidding, listing, messaging, and more.</p>
              </div>
              <Link to="/dashboard/verification">
                <Button size="sm" className="gap-1.5 shrink-0">
                  Verify <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {isVerified === true && (
        <div className="mb-6 flex items-center gap-2 px-3 py-2 rounded-lg border border-green-500/20 bg-green-50/50 dark:bg-green-950/10">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="font-body text-xs text-green-700 dark:text-green-400">Identity Verified — Full access enabled</span>
        </div>
      )

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
