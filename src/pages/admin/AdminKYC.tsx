import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, ShieldAlert, Clock, CheckCircle, XCircle, User, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface KYCRecord {
  id: string;
  user_id: string;
  full_name: string | null;
  bvn_hash: string | null;
  nin_hash: string | null;
  bvn_verified: boolean;
  nin_verified: boolean;
  verification_status: string;
  proof_of_funds_url: string | null;
  rejected_reason: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  profile_name?: string | null;
  profile_email?: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  verified: { label: "Verified", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const AdminKYC = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KYCRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [tab, setTab] = useState("pending");

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kyc_verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch profile names for each user
    const userIds = (data || []).map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

    setRecords(
      (data || []).map((r) => ({
        ...r,
        profile_name: profileMap.get(r.user_id) || r.full_name,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleApprove = async (record: KYCRecord) => {
    setProcessing(true);
    const { error } = await supabase
      .from("kyc_verifications")
      .update({
        verification_status: "verified",
        bvn_verified: !!record.bvn_hash,
        nin_verified: !!record.nin_hash,
        verified_at: new Date().toISOString(),
        rejected_reason: null,
      })
      .eq("id", record.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approved", description: `KYC for ${record.profile_name || "user"} has been verified.` });
      setSelected(null);
      fetchRecords();
    }
    setProcessing(false);
  };

  const handleReject = async (record: KYCRecord) => {
    if (!rejectReason.trim()) {
      toast({ title: "Required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    const { error } = await supabase
      .from("kyc_verifications")
      .update({
        verification_status: "rejected",
        rejected_reason: rejectReason.trim(),
        bvn_verified: false,
        nin_verified: false,
      })
      .eq("id", record.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rejected", description: `KYC for ${record.profile_name || "user"} has been rejected.` });
      setSelected(null);
      setRejectReason("");
      fetchRecords();
    }
    setProcessing(false);
  };

  const filtered = records.filter((r) => {
    if (tab === "all") return true;
    return r.verification_status === tab;
  });

  const counts = {
    pending: records.filter((r) => r.verification_status === "pending").length,
    verified: records.filter((r) => r.verification_status === "verified").length,
    rejected: records.filter((r) => r.verification_status === "rejected").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground text-sm">Review and manage identity verification submissions from bidders.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{counts.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{counts.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs + List */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({counts.verified})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
            <TabsTrigger value="all">All ({records.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {loading ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Loading submissions...</p>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No {tab === "all" ? "" : tab} KYC submissions found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((record) => {
                  const cfg = statusConfig[record.verification_status] || statusConfig.pending;
                  return (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{record.profile_name || "Unknown User"}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {record.bvn_hash && <span>BVN: •••{record.bvn_hash.slice(-4)}</span>}
                              {record.nin_hash && <span>NIN: •••{record.nin_hash.slice(-4)}</span>}
                              <span>• {new Date(record.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          <Button size="sm" variant="outline" onClick={() => { setSelected(record); setRejectReason(""); }}>
                            <Eye className="w-4 h-4 mr-1" /> Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              KYC Review
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-medium">{selected.profile_name || selected.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant={statusConfig[selected.verification_status]?.variant || "secondary"}>
                    {statusConfig[selected.verification_status]?.label || selected.verification_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">BVN</p>
                  <p className="font-mono">{selected.bvn_hash || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">NIN</p>
                  <p className="font-mono">{selected.nin_hash || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Date of Birth</p>
                  <p>{selected.date_of_birth || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Submitted</p>
                  <p>{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                {selected.verified_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Verified At</p>
                    <p>{new Date(selected.verified_at).toLocaleString()}</p>
                  </div>
                )}
                {selected.rejected_reason && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Rejection Reason</p>
                    <p className="text-destructive">{selected.rejected_reason}</p>
                  </div>
                )}
              </div>

              {selected.proof_of_funds_url && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Proof of Funds</p>
                  <a href={selected.proof_of_funds_url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                    View Document
                  </a>
                </div>
              )}

              {selected.verification_status === "pending" && (
                <div className="space-y-3 pt-2 border-t">
                  <Textarea
                    placeholder="Rejection reason (required only if rejecting)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                  />
                  <DialogFooter className="flex gap-2">
                    <Button variant="destructive" onClick={() => handleReject(selected)} disabled={processing}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => handleApprove(selected)} disabled={processing}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {selected.verification_status !== "pending" && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminKYC;
