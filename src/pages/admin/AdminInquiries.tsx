import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-accent/10 text-accent", icon: Clock },
  responded: { color: "bg-primary/10 text-primary", icon: CheckCircle2 },
  closed: { color: "bg-muted text-muted-foreground", icon: XCircle },
};

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from("inquiries")
      .select("*, properties(title, city, price, images), profiles!inquiries_user_id_fkey(full_name, phone)")
      .order("created_at", { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    toast({ title: `Inquiry marked as ${status}` });
    fetchInquiries();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      (inq.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inq.properties?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      inq.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts: Record<string, number> = { all: inquiries.length };
  inquiries.forEach(i => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground font-body text-sm">{inquiries.length} total inquiries</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "responded", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${
              statusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search inquiries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No inquiries found.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((inq) => {
            const cfg = statusConfig[inq.status] || statusConfig.pending;
            return (
              <Card key={inq.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(inq)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm">
                      {inq.profiles?.full_name || "User"} <ArrowRight className="w-3 h-3 inline text-muted-foreground mx-1" /> {inq.properties?.title || "Property"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body line-clamp-1 mt-0.5">{inq.message}</p>
                  </div>
                  <Badge className={`${cfg.color} text-[10px]`}>{inq.status}</Badge>
                  <span className="text-[10px] text-muted-foreground font-body whitespace-nowrap">{timeAgo(inq.created_at)}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-body font-medium text-foreground mb-1">From: {selected.profiles?.full_name || "User"}</p>
                {selected.profiles?.phone && (
                  <p className="text-xs text-muted-foreground font-body">Phone: {selected.profiles.phone}</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-body font-medium text-foreground mb-1">Property: {selected.properties?.title}</p>
                <p className="text-xs text-muted-foreground font-body">
                  {selected.properties?.city} · ₦{selected.properties?.price?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body mb-1">Message:</p>
                <p className="text-sm font-body text-foreground bg-card p-3 rounded-lg border border-border">{selected.message}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge className={statusConfig[selected.status]?.color || ""}>{selected.status}</Badge>
                <p className="text-xs text-muted-foreground font-body">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {selected.status === "pending" && (
                  <Button size="sm" onClick={() => updateStatus(selected.id, "responded")} className="bg-primary hover:bg-primary/90">
                    Mark Responded
                  </Button>
                )}
                {selected.status !== "closed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "closed")}>
                    Close Inquiry
                  </Button>
                )}
                {selected.status === "closed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "pending")}>
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminInquiries;
