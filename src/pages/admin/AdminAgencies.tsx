import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminAgencies = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgencies = async () => {
    const { data } = await supabase.from("agencies").select("*").order("created_at", { ascending: false });
    setAgencies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAgencies(); }, []);

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from("agencies").update({ verified: !current }).eq("id", id);
    toast({ title: current ? "Agency unverified" : "Agency verified" });
    fetchAgencies();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agencies</h1>
        <p className="text-muted-foreground font-body text-sm">{agencies.length} registered agencies</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agencies.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agencies registered yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {agencies.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  {a.logo_url ? <img src={a.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : (
                    <span className="text-accent font-display font-bold">{a.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{a.city}, {a.state} · {a.phone}</p>
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

export default AdminAgencies;
