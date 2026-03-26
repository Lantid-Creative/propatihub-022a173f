import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, AlertTriangle, Clock, CheckCircle, Shield, Users
} from "lucide-react";

const AdminDisputes = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("resolved");

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Enrich with profiles
      const userIds = [...new Set(data.flatMap(d => [d.filed_by, d.filed_against].filter(Boolean)))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds.length > 0 ? userIds : ["none"]);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const propIds = [...new Set(data.map(d => d.property_id).filter(Boolean))];
      const { data: props } = await supabase.from("properties").select("id, title, city").in("id", propIds.length > 0 ? propIds : ["none"]);
      const propMap = new Map(props?.map(p => [p.id, p]) || []);

      setDisputes(data.map(d => ({
        ...d,
        filer_name: profileMap.get(d.filed_by) || "Unknown",
        against_name: d.filed_against ? profileMap.get(d.filed_against) || "Unknown" : "N/A",
        property: propMap.get(d.property_id),
      })));
    }
    setLoading(false);
  };

  const handleResolve = async (id: string) => {
    const updates: any = { status: statusUpdate };
    if (adminNotes) updates.admin_notes = adminNotes;
    if (statusUpdate === "resolved") {
      updates.resolution_summary = resolutionText;
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase.from("disputes").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dispute updated" });
      setResolvingId(null);
      setResolutionText("");
      setAdminNotes("");
      fetchDisputes();
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
      open: { color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3 h-3" /> },
      under_review: { color: "bg-accent/15 text-accent-foreground", icon: <Clock className="w-3 h-3" /> },
      resolved: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      escalated: { color: "bg-destructive/15 text-destructive", icon: <Shield className="w-3 h-3" /> },
    };
    const cfg = map[status] || { color: "bg-muted text-muted-foreground", icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${cfg.color}`}>
        {cfg.icon} {status.replace("_", " ")}
      </span>
    );
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === "open").length,
    under_review: disputes.filter(d => d.status === "under_review").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dispute Management</h1>
          <p className="text-sm font-body text-muted-foreground">Review and resolve disputes filed by tenants, landlords, and agents</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <MessageSquare className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs font-body text-muted-foreground">Total Disputes</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-1" />
            <p className="font-display text-2xl font-bold text-foreground">{stats.open}</p>
            <p className="text-xs font-body text-muted-foreground">Open</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="font-display text-2xl font-bold text-foreground">{stats.under_review}</p>
            <p className="text-xs font-body text-muted-foreground">Under Review</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-display text-2xl font-bold text-foreground">{stats.resolved}</p>
            <p className="text-xs font-body text-muted-foreground">Resolved</p>
          </CardContent></Card>
        </div>

        {disputes.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">No disputes filed yet.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-display font-bold text-foreground">{d.subject}</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">{d.description}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {statusBadge(d.status)}
                      <Badge variant="outline" className="text-[10px]">{d.priority}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-body text-muted-foreground mb-3">
                    <div><span className="font-medium text-foreground">Filed by:</span> {d.filer_name}</div>
                    <div><span className="font-medium text-foreground">Against:</span> {d.against_name}</div>
                    <div><span className="font-medium text-foreground">Category:</span> {d.category.replace("_", " ")}</div>
                    <div><span className="font-medium text-foreground">Property:</span> {d.property?.title || "N/A"}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">Filed {new Date(d.created_at).toLocaleDateString()}</p>

                  {d.resolution_summary && (
                    <div className="bg-primary/5 rounded-lg p-3 mb-3 border border-primary/10">
                      <p className="text-xs font-medium text-primary">Resolution:</p>
                      <p className="text-xs text-foreground">{d.resolution_summary}</p>
                    </div>
                  )}

                  {resolvingId === d.id ? (
                    <div className="space-y-3 border-t border-border pt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-body font-medium text-foreground block mb-1">Update Status</label>
                          <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="escalated">Escalated</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-body font-medium text-foreground block mb-1">Admin Notes</label>
                          <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." rows={2} />
                        </div>
                      </div>
                      {statusUpdate === "resolved" && (
                        <div>
                          <label className="text-xs font-body font-medium text-foreground block mb-1">Resolution Summary (visible to parties)</label>
                          <Textarea value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} placeholder="Summarize the resolution..." rows={3} />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleResolve(d.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setResolvingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    d.status !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => { setResolvingId(d.id); setStatusUpdate(d.status === "open" ? "under_review" : "resolved"); }}>
                        Manage Dispute
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDisputes;
