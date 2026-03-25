import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserSearches = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSearches(); }, [user]);

  const deleteSearch = async (id: string) => {
    await supabase.from("saved_searches").delete().eq("id", id);
    toast({ title: "Search deleted" });
    fetchSearches();
  };

  const toggleAlert = async (id: string, current: boolean) => {
    await supabase.from("saved_searches").update({ alert_enabled: !current }).eq("id", id);
    toast({ title: current ? "Alerts disabled" : "Alerts enabled" });
    fetchSearches();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Saved Searches</h1>
        <p className="text-muted-foreground font-body text-sm">{searches.length} saved searches</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searches.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No saved searches. When you search for properties, you can save your search to get alerts.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {searches.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-body font-semibold text-foreground text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Created {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => toggleAlert(s.id, s.alert_enabled)}>
                  {s.alert_enabled ? <Bell className="w-4 h-4 text-accent" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteSearch(s.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserSearches;
