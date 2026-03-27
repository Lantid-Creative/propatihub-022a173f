import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Building, Globe, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminAgencies = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const fetchAgencies = async () => {
    const { data } = await supabase.from("agencies").select("*").order("created_at", { ascending: false });
    setAgencies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAgencies(); }, []);

  const toggleVerified = async (id: string, current: boolean) => {
    await supabase.from("agencies").update({ verified: !current }).eq("id", id);
    toast({ title: current ? "Agency unverified" : "Agency verified ✓" });
    fetchAgencies();
    if (selected?.id === id) setSelected({ ...selected, verified: !current });
  };

  const filtered = agencies.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "verified" ? a.verified : !a.verified);
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: agencies.length,
    verified: agencies.filter(a => a.verified).length,
    pending: agencies.filter(a => !a.verified).length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Management</h1>
        <p className="text-muted-foreground font-body text-sm">{agencies.length} registered agencies</p>
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
        <Input placeholder="Search agencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agencies found.</p></CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(a)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    {a.logo_url ? (
                      <img src={a.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {a.city || "—"}, {a.state || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={a.verified ? "default" : "secondary"} className={a.verified ? "bg-primary/10 text-primary" : ""}>
                    {a.verified ? "✓ Verified" : "Pending"}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
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
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-accent" />
              </div>
              {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {selected.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                    <Globe className="w-4 h-4" /> {selected.website}
                  </div>
                )}
                {selected.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-body col-span-2">
                    <MapPin className="w-4 h-4 shrink-0" /> {selected.address}, {selected.city}, {selected.state}
                  </div>
                )}
              </div>
              {selected.description && (
                <p className="text-sm text-muted-foreground font-body border-t border-border pt-3">{selected.description}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => toggleVerified(selected.id, selected.verified)}
                  className={selected.verified ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
                >
                  {selected.verified ? (
                    <><XCircle className="w-4 h-4 mr-2" /> Revoke Verification</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Verify Agency</>
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

export default AdminAgencies;
