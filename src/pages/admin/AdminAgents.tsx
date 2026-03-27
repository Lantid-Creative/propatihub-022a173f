import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, UserCheck, Award, Briefcase, Building2, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const fetchAgents = async () => {
    const { data } = await supabase
      .from("agent_profiles")
      .select("*, profiles!agent_profiles_user_id_fkey(full_name, phone, city, state), agencies(name)")
      .order("created_at", { ascending: false });
    setAgents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from("agent_profiles").update({ verified: !current }).eq("id", id);
    toast({ title: current ? "Agent unverified" : "Agent verified ✓" });
    fetchAgents();
    if (selected?.id === id) setSelected({ ...selected, verified: !current });
  };

  const filtered = agents.filter((a) => {
    const name = a.profiles?.full_name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (a.specialization || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.license_number || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "verified" ? a.verified : !a.verified);
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: agents.length,
    verified: agents.filter(a => a.verified).length,
    pending: agents.filter(a => !a.verified).length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agent Management</h1>
        <p className="text-muted-foreground font-body text-sm">{agents.length} registered agents</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "verified", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
              filter === f ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, specialization, or license..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agents found.</p></CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(a)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-display font-bold text-sm">
                      {(a.profiles?.full_name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm truncate">{a.profiles?.full_name || "Agent"}</p>
                    <p className="text-xs text-muted-foreground font-body">{a.specialization || "General"}</p>
                  </div>
                  <Badge variant={a.verified ? "default" : "secondary"} className={a.verified ? "bg-primary/10 text-primary text-[10px]" : "text-[10px]"}>
                    {a.verified ? "✓ Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {a.experience_years || 0} yrs</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {a.total_listings || 0} listings</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {a.total_sales || 0} sales</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              {selected?.profiles?.full_name || "Agent"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-4 h-4" /> {selected.specialization || "General"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-4 h-4" /> {selected.experience_years || 0} years exp.
                </div>
                {selected.license_number && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    License: {selected.license_number}
                  </div>
                )}
                {(selected.profiles?.city || selected.profiles?.state) && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="w-4 h-4" /> {selected.profiles.city}, {selected.profiles.state}
                  </div>
                )}
                {selected.agencies?.name && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Building2 className="w-4 h-4" /> Agency: {selected.agencies.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-display font-bold text-foreground">{selected.total_listings || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Listings</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-display font-bold text-foreground">{selected.total_sales || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Sales</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-display font-bold text-foreground">{selected.experience_years || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Years</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => toggleVerified(selected.id, selected.verified)}
                  className={selected.verified ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
                >
                  {selected.verified ? (
                    <><XCircle className="w-4 h-4 mr-2" /> Revoke Verification</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Verify Agent</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminAgents;
