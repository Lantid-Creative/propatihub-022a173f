import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const AgencyAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("id").eq("owner_id", user.id).single();
      if (ag) {
        const { data } = await supabase
          .from("agent_profiles")
          .select("*, profiles!agent_profiles_user_id_fkey(full_name, phone)")
          .eq("agency_id", ag.id);
        setAgents(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground font-body text-sm">{agents.length} agents</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agents in your agency yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {agents.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-display font-bold text-sm">
                    {(a.profiles?.full_name || "A")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-body font-semibold text-foreground text-sm">{a.profiles?.full_name || "Agent"}</p>
                  <p className="text-xs text-muted-foreground font-body">{a.specialization || "General"} · {a.total_listings} listings</p>
                </div>
                <Badge variant={a.verified ? "default" : "secondary"}>{a.verified ? "Verified" : "Pending"}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgencyAgents;
