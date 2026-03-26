import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Phone, ExternalLink, Clock, CheckCircle2, XCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AgentInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInq, setSelectedInq] = useState<any>(null);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("inquiries")
      .select("*, properties(id, title, city, state, price, images), profiles!inquiries_user_id_fkey(full_name, phone, email:user_id)")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    toast({ title: `Inquiry marked as ${status}` });
    fetchInquiries();
    if (selectedInq?.id === id) setSelectedInq((prev: any) => prev ? { ...prev, status } : null);
  };

  const fmt = (p: number) => `₦${p.toLocaleString()}`;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filtered = statusFilter === "all" ? inquiries : inquiries.filter((inq) => inq.status === statusFilter);

  const counts = {
    all: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    responded: inquiries.filter((i) => i.status === "responded").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground font-body text-sm">
          {inquiries.length} total · {counts.pending} awaiting response
        </p>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="responded" className="text-xs">Responded ({counts.responded})</TabsTrigger>
          <TabsTrigger value="closed" className="text-xs">Closed ({counts.closed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInq} onOpenChange={(o) => !o && setSelectedInq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInq && (
            <div className="space-y-4">
              {/* Property */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-14 h-12 rounded-lg bg-card overflow-hidden shrink-0">
                  {selectedInq.properties?.images?.[0] && (
                    <img src={selectedInq.properties.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-medium text-foreground truncate">{selectedInq.properties?.title}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {selectedInq.properties?.city}, {selectedInq.properties?.state} · {fmt(selectedInq.properties?.price || 0)}
                  </p>
                </div>
                <Link to={`/property/${selectedInq.properties?.id}`}>
                  <Button size="icon" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                </Link>
              </div>

              {/* Contact */}
              <div className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-body text-sm text-foreground font-medium">{selectedInq.profiles?.full_name || "User"}</span>
                </div>
                {selectedInq.profiles?.phone && (
                  <a href={`tel:${selectedInq.profiles.phone}`} className="flex items-center gap-2 text-sm font-body text-accent hover:underline">
                    <Phone className="w-4 h-4" /> {selectedInq.profiles.phone}
                  </a>
                )}
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-body text-muted-foreground mb-1">Message</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-body text-foreground whitespace-pre-line">{selectedInq.message}</p>
                </div>
                <p className="text-[10px] font-body text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {new Date(selectedInq.created_at).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Badge variant={selectedInq.status === "pending" ? "secondary" : "default"} className="capitalize">
                  {selectedInq.status}
                </Badge>
                <div className="flex gap-2">
                  {selectedInq.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(selectedInq.id, "responded")} className="gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mark Responded
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedInq.id, "closed")} className="gap-1">
                        <XCircle className="w-3 h-3" /> Close
                      </Button>
                    </>
                  )}
                  {selectedInq.status === "responded" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selectedInq.id, "closed")} className="gap-1">
                      <XCircle className="w-3 h-3" /> Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body mb-1">
              {inquiries.length === 0 ? "No inquiries yet" : "No inquiries match this filter"}
            </p>
            <p className="text-xs text-muted-foreground font-body">Inquiries from interested buyers will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <Card key={inq.id} className="card-hover cursor-pointer" onClick={() => setSelectedInq(inq)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent font-display font-bold text-sm">
                      {(inq.profiles?.full_name || "U")[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-body font-semibold text-foreground text-sm truncate">
                        {inq.profiles?.full_name || "User"}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={inq.status === "pending" ? "secondary" : "default"}
                          className={`text-[10px] ${inq.status === "pending" ? "animate-pulse" : ""}`}
                        >
                          {inq.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-body">{timeAgo(inq.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-1.5">
                      Re: <span className="text-foreground">{inq.properties?.title || "Property"}</span> · {inq.properties?.city}
                    </p>
                    <p className="text-sm text-foreground/80 font-body line-clamp-2">{inq.message}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                {inq.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border ml-14">
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      onClick={(e) => { e.stopPropagation(); updateStatus(inq.id, "responded"); }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Responded
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={(e) => { e.stopPropagation(); updateStatus(inq.id, "closed"); }}
                    >
                      <XCircle className="w-3 h-3" /> Close
                    </Button>
                    {inq.profiles?.phone && (
                      <a href={`tel:${inq.profiles.phone}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="text-xs gap-1">
                          <Phone className="w-3 h-3" /> Call
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentInquiries;
