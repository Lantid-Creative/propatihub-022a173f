import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgents = async () => {
    const { data } = await supabase
      .from("agent_profiles")
      .select("*, profiles!agent_profiles_user_id_fkey(full_name, phone, city, state)")
      .order("created_at", { ascending: false });
    setAgents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from("agent_profiles").update({ verified: !current }).eq("id", id);
    toast({ title: current ? "Agent unverified" : "Agent verified" });
    fetchAgents();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agents</h1>
        <p className="text-muted-foreground font-body text-sm">{agents.length} registered agents</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agents registered yet.</p></CardContent></Card>
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
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground text-sm">{a.profiles?.full_name || "Agent"}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {a.specialization || "General"} · {a.experience_years} yrs · {a.total_listings} listings
                  </p>
                </div>
                <Badge variant={a.verified ? "default" : "secondary"}>
                  {a.verified ? "Verified" : "Pending"}
                </Badge>
                <Button size="icon" variant="ghost" onClick={() => toggleVerified(a.id, a.verified)}>
                  {a.verified ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-primary" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAgents;
