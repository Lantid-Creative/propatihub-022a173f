import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, ShieldAlert, Search, Eye, CheckCircle, XCircle, RotateCcw, Loader2, User, Building2, FileText, Clock, Filter } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, type VerificationProfile, type VerificationAuditLog, type BiometricVerification } from "@/types/verification";
import { format } from "date-fns";

const AdminVerifications = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<VerificationProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  
  // Detail modal
  const [selectedVerification, setSelectedVerification] = useState<VerificationProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);
  const [biometricResults, setBiometricResults] = useState<BiometricVerification[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  
  // Review modal
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "resubmit" | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kyc-verification", {
        body: {
          action: "admin_list_verifications",
          status_filter: statusFilter || undefined,
          type_filter: typeFilter || undefined,
          search: search || undefined,
          page,
          per_page: 20,
        },
      });
      if (error) throw error;
      setVerifications(data.verifications || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to fetch verifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [page, statusFilter, typeFilter]);

  const openDetail = async (v: VerificationProfile) => {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kyc-verification", {
        body: { action: "admin_get_verification_detail", verification_id: v.id },
      });
      if (error) throw error;
      setSelectedVerification({ ...data.verification, user_email: data.user_email });
      setAuditLogs(data.audit_logs || []);
      setBiometricResults(data.biometric_results || []);
    } catch {
      toast({ title: "Error", description: "Failed to load details", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedVerification || !reviewAction) return;
    if ((reviewAction === "reject" || reviewAction === "resubmit") && !reviewReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason", variant: "destructive" });
      return;
    }
    setReviewing(true);
    try {
      const { error } = await supabase.functions.invoke("kyc-verification", {
        body: {
          action: "admin_review",
          verification_id: selectedVerification.id,
          decision: reviewAction,
          reason: reviewReason,
          notes: reviewNotes,
        },
      });
      if (error) throw error;
      toast({ title: "Review submitted", description: `Verification ${reviewAction}d successfully.` });
      setShowDetail(false);
      setReviewAction(null);
      setReviewReason("");
      setReviewNotes("");
      fetchVerifications();
    } catch {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    } finally {
      setReviewing(false);
    }
  };

  const pendingCount = verifications.filter((v) => v.status === "pending_review" || v.status === "under_manual_review").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Verification Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {total} total · {pendingCount} pending review
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, CAC, license..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" onKeyDown={(e) => e.key === "Enter" && fetchVerifications()} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="under_manual_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_resubmission">Needs Resubmission</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="api_partner">API Partner</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchVerifications} className="gap-1">
                <Filter className="w-4 h-4" /> Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Liveness</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{v.full_legal_name || v.business_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{v.user_email || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{v.verification_type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[v.status]} border-0 text-xs`}>
                          {STATUS_LABELS[v.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {v.biometric_verified ? (
                          <span className="text-green-600 text-xs font-medium">✓ Passed</span>
                        ) : v.liveness_score ? (
                          <span className="text-amber-600 text-xs">{(v.liveness_score * 100).toFixed(0)}%</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {v.submitted_at ? format(new Date(v.submitted_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openDetail(v)} className="gap-1">
                          <Eye className="w-3.5 h-3.5" /> Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {verifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No verifications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm self-center text-muted-foreground">Page {page + 1} of {Math.ceil(total / 20)}</span>
            <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : selectedVerification ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Verification Review — {selectedVerification.full_legal_name || selectedVerification.business_name}
                    <Badge className={`${STATUS_COLORS[selectedVerification.status]} border-0 ml-auto`}>
                      {STATUS_LABELS[selectedVerification.status]}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <DetailRow label="Email" value={selectedVerification.user_email || "—"} />
                      <DetailRow label="Type" value={selectedVerification.verification_type} />
                      <DetailRow label="Full Name" value={selectedVerification.full_legal_name || "—"} />
                      <DetailRow label="Phone" value={selectedVerification.phone || "—"} />
                      <DetailRow label="DOB" value={selectedVerification.date_of_birth || "—"} />
                      <DetailRow label="ID Type" value={selectedVerification.id_type || "—"} />
                      <DetailRow label="ID Number" value={selectedVerification.id_number_masked || "—"} />
                      {selectedVerification.residential_address && <DetailRow label="Address" value={selectedVerification.residential_address} />}
                      {selectedVerification.agent_license_number && <DetailRow label="License #" value={selectedVerification.agent_license_number} />}
                      {selectedVerification.business_name && <DetailRow label="Business" value={selectedVerification.business_name} />}
                      {selectedVerification.cac_registration_number && <DetailRow label="CAC #" value={selectedVerification.cac_registration_number} />}
                      {selectedVerification.director_full_name && <DetailRow label="Director" value={selectedVerification.director_full_name} />}
                      <DetailRow label="Attempts" value={`${selectedVerification.attempt_count} / ${selectedVerification.max_attempts}`} />
                      <DetailRow label="Biometric Consent" value={selectedVerification.biometric_consent ? "Yes" : "No"} />
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-4 space-y-3">
                    {(selectedVerification.verification_documents || []).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No documents uploaded</p>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selectedVerification.verification_documents!.map((doc) => {
                          const isImage = doc.mime_type?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name);
                          return (
                            <div key={doc.id} className="rounded-lg border overflow-hidden">
                              {isImage && doc.signed_url ? (
                                <a href={doc.signed_url} target="_blank" rel="noopener noreferrer">
                                  <img src={doc.signed_url} alt={doc.document_type} className="w-full h-40 object-cover bg-muted" />
                                </a>
                              ) : doc.signed_url ? (
                                <div className="w-full h-40 bg-muted flex items-center justify-center">
                                  <FileText className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                              ) : null}
                              <div className="p-3 flex items-center justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium capitalize truncate">{doc.document_type.replace(/_/g, " ")}</p>
                                  <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
                                </div>
                                {doc.signed_url && (
                                  <Button variant="outline" size="sm" asChild className="shrink-0 ml-2">
                                    <a href={doc.signed_url} target="_blank" rel="noopener noreferrer">Open</a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="biometrics" className="mt-4 space-y-3">
                    {biometricResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Camera className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          {selectedVerification.verification_type === "customer"
                            ? "Not required for buyer/bidder verification"
                            : "No biometric attempts recorded"}
                        </p>
                      </div>
                    ) : (
                      biometricResults.map((b) => (
                        <div key={b.id} className="p-3 rounded-lg border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Attempt #{b.attempt_number}</span>
                            <Badge variant={b.liveness_passed ? "default" : "destructive"} className="text-xs">
                              {b.liveness_passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          {b.image_path && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                              <img src={b.image_path} alt="Liveness capture" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Liveness Score: <strong>{b.liveness_score ? (b.liveness_score * 100).toFixed(1) + "%" : "—"}</strong></div>
                            <div>Face Match: <strong>{b.face_match_score ? (b.face_match_score * 100).toFixed(1) + "%" : "—"}</strong></div>
                            <div>Date: {format(new Date(b.created_at), "MMM d, yyyy HH:mm")}</div>
                          </div>
                          {b.error_message && <p className="text-xs text-destructive">{b.error_message}</p>}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="audit" className="mt-4 space-y-2">
                    {auditLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No audit entries</p>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground"> by {log.actor_role || "system"}</span>
                            <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>

                {/* Review Actions */}
                {(selectedVerification.status === "pending_review" || selectedVerification.status === "under_manual_review") && (
                  <div className="mt-6 pt-4 border-t space-y-4">
                    <h3 className="font-semibold text-sm">Review Decision</h3>
                    {reviewAction ? (
                      <div className="space-y-3">
                        {(reviewAction === "reject" || reviewAction === "resubmit") && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Reason (required)</Label>
                            <Textarea value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} placeholder={reviewAction === "reject" ? "Reason for rejection..." : "What needs to be corrected..."} />
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Admin Notes (optional)</Label>
                          <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Internal notes..." />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleReview} disabled={reviewing} className="gap-1">
                            {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Confirm {reviewAction === "approve" ? "Approval" : reviewAction === "reject" ? "Rejection" : "Resubmission Request"}
                          </Button>
                          <Button variant="outline" onClick={() => setReviewAction(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => setReviewAction("approve")} className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                        <Button variant="destructive" onClick={() => setReviewAction("reject")} className="gap-1">
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                        <Button variant="outline" onClick={() => setReviewAction("resubmit")} className="gap-1">
                          <RotateCcw className="w-4 h-4" /> Request Resubmission
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className || ""}`}>{children}</label>;
}

export default AdminVerifications;
