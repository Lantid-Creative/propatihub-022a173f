import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, Clock, CheckCircle, MessageSquare, Plus, Loader2, Shield
} from "lucide-react";

interface DisputeManagerProps {
  tenancies: any[];
  role: "tenant" | "landlord" | "agent";
  onDisputeFiled?: () => void;
}

const categories = [
  { value: "rent", label: "Rent Dispute" },
  { value: "maintenance", label: "Maintenance Issue" },
  { value: "deposit", label: "Caution Fee / Deposit" },
  { value: "lease_terms", label: "Lease Terms Violation" },
  { value: "noise", label: "Noise / Disturbance" },
  { value: "property_damage", label: "Property Damage" },
  { value: "eviction", label: "Eviction Dispute" },
  { value: "general", label: "General Complaint" },
];

const DisputeManager = ({ tenancies, role, onDisputeFiled }: DisputeManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filing, setFiling] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tenancy_id: "",
    category: "general",
    subject: "",
    description: "",
    priority: "medium",
  });

  const fetchDisputes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("disputes")
      .select("*")
      .or(`filed_by.eq.${user.id},filed_against.eq.${user.id}`)
      .order("created_at", { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  };

  useState(() => {
    fetchDisputes();
  });

  const handleFile = async () => {
    if (!form.subject || !form.description || !form.tenancy_id) {
      toast({ 
        title: "Required Information Missing", 
        description: "Please ensure all required fields are filled out before submitting your dispute.", 
        variant: "destructive" 
      });
      return;
    }
    setFiling(true);
    const tenancy = tenancies.find((t) => t.id === form.tenancy_id);
    const filedAgainst = role === "tenant" ? tenancy?.landlord_id : tenancy?.tenant_id;

    const { error } = await supabase.from("disputes").insert({
      tenancy_id: form.tenancy_id,
      property_id: tenancy?.property_id,
      filed_by: user!.id,
      filed_against: filedAgainst || null,
      category: form.category,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
    } as any);

    if (error) {
      toast({ 
        title: "Dispute Submission Error", 
        description: error.message || "We encountered an issue while logging your dispute. Please try again or contact support.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Dispute Successfully Filed", 
        description: "Your complaint has been logged. Our mediation team will review the details and contact all parties involved.",
        className: "bg-primary text-primary-foreground border-none",
      });
      setShowForm(false);
      setForm({ tenancy_id: "", category: "general", subject: "", description: "", priority: "medium" });
      fetchDisputes();
      onDisputeFiled?.();
    }
    setFiling(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" /> Disputes
        </h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="gap-1">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "File Dispute"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">File a New Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">Tenancy *</label>
                <Select value={form.tenancy_id} onValueChange={(v) => setForm({ ...form, tenancy_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tenancy" /></SelectTrigger>
                  <SelectContent>
                    {tenancies.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.property?.title || t.tenant?.full_name || "Tenancy"} — {t.property?.city || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">Subject *</label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of your complaint" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium text-foreground block mb-1.5">Description *</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." rows={4} />
            </div>
            <Button onClick={handleFile} disabled={filing} className="w-full gap-2">
              {filing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {filing ? "Filing..." : "Submit Dispute"}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <Card><CardContent className="py-10 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No disputes filed. If you have a complaint, click "File Dispute" above.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm">{d.subject}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-2">{d.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{d.category.replace("_", " ")}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {d.resolution_summary && (
                      <div className="mt-2 bg-muted/50 rounded-lg p-2">
                        <p className="text-xs font-medium text-foreground">Resolution:</p>
                        <p className="text-xs text-muted-foreground">{d.resolution_summary}</p>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">{statusBadge(d.status)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputeManager;
