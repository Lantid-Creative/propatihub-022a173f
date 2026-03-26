import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Phone, Mail, Building2, Award, Calendar, Eye, X } from "lucide-react";

const AgencyAgents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [agentProperties, setAgentProperties] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("id").eq("owner_id", user.id).single();
      if (ag) {
        setAgencyId(ag.id);
        const { data } = await supabase
          .from("agent_profiles")
          .select("*")
          .eq("agency_id", ag.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          // Fetch profiles separately
          const userIds = data.map((a) => a.user_id);
          const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
          const profileMap: Record<string, any> = {};
          (profiles || []).forEach((p) => { profileMap[p.user_id] = p; });
          const enriched = data.map((a) => ({ ...a, profile: profileMap[a.user_id] || null }));
          setAgents(enriched);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const viewAgentDetails = async (agent: any) => {
    setSelectedAgent(agent);
    if (agencyId) {
      const { data } = await supabase
        .from("properties")
        .select("id, title, city, state, price, status, views_count")
        .eq("agent_id", agent.user_id)
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false })
        .limit(10);
      setAgentProperties(data || []);
    }
  };

  const fmt = (p: number) => `₦${p.toLocaleString()}`;

  const filtered = agents
    .filter((a) => {
      if (filter === "verified") return a.verified;
      if (filter === "pending") return !a.verified;
      return true;
    })
    .filter((a) => {
      if (!searchTerm) return true;
      const name = a.profile?.full_name || "";
      const spec = a.specialization || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || spec.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground font-body text-sm">{agents.length} agents in your agency</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({agents.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({agents.filter((a) => a.verified).length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({agents.filter((a) => !a.verified).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-body mb-1">
              {searchTerm || filter !== "all" ? "No agents match your filters" : "No agents in your agency yet"}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Agents can join your agency by selecting it when setting up their profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewAgentDetails(a)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-display font-bold text-lg">
                      {(a.profile?.full_name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm truncate">
                      {a.profile?.full_name || "Agent"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">{a.specialization || "General Practice"}</p>
                  </div>
                  <Badge variant={a.verified ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {a.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-b border-border mb-3">
                  <div>
                    <p className="text-lg font-display font-bold text-foreground">{a.total_listings || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Listings</p>
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-foreground">{a.total_sales || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Sales</p>
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-foreground">{a.experience_years || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Years</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                  {a.license_number && (
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Licensed</span>
                  )}
                  {a.profile?.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Available</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Agent Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-display font-bold text-2xl">
                    {(selectedAgent.profile?.full_name || "A")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    {selectedAgent.profile?.full_name || "Agent"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">{selectedAgent.specialization || "General Practice"}</p>
                  <Badge variant={selectedAgent.verified ? "default" : "secondary"} className="mt-1">
                    {selectedAgent.verified ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedAgent.profile?.phone && (
                  <div className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {selectedAgent.profile.phone}
                  </div>
                )}
                {selectedAgent.profile?.city && (
                  <div className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {selectedAgent.profile.city}, {selectedAgent.profile.state}
                  </div>
                )}
                {selectedAgent.license_number && (
                  <div className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    License: {selectedAgent.license_number}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-body text-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {selectedAgent.experience_years || 0} years experience
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{selectedAgent.total_listings || 0}</p>
                  <p className="text-xs text-muted-foreground font-body">Listings</p>
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{selectedAgent.total_sales || 0}</p>
                  <p className="text-xs text-muted-foreground font-body">Sales</p>
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-foreground">{agentProperties.length}</p>
                  <p className="text-xs text-muted-foreground font-body">Active</p>
                </div>
              </div>

              {/* Agent's Properties */}
              {agentProperties.length > 0 && (
                <div>
                  <h4 className="font-body text-sm font-semibold text-foreground mb-2">Recent Listings</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {agentProperties.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-xs font-medium text-foreground truncate">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground font-body">{p.city}, {p.state}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-display font-bold text-accent">{fmt(p.price)}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" /> {p.views_count || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgencyAgents;
