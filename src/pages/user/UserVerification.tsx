import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, ShieldAlert, Clock, AlertTriangle, CheckCircle2,
  ArrowRight, Loader2, FileText, Camera, User, XCircle, RefreshCw
} from "lucide-react";

interface VerificationRecord {
  id: string;
  verification_type: string;
  status: string;
  full_legal_name: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  resubmission_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgClass: string }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", icon: ShieldAlert, bgClass: "bg-muted" },
  in_progress: { label: "In Progress", color: "text-amber-600", icon: Clock, bgClass: "bg-amber-50 dark:bg-amber-950/20" },
  awaiting_liveness: { label: "Face Verification Needed", color: "text-amber-600", icon: Camera, bgClass: "bg-amber-50 dark:bg-amber-950/20" },
  awaiting_documents: { label: "Documents Needed", color: "text-amber-600", icon: FileText, bgClass: "bg-amber-50 dark:bg-amber-950/20" },
  pending_review: { label: "Under Review", color: "text-blue-600", icon: Clock, bgClass: "bg-blue-50 dark:bg-blue-950/20" },
  under_manual_review: { label: "Under Review", color: "text-blue-600", icon: Clock, bgClass: "bg-blue-50 dark:bg-blue-950/20" },
  approved: { label: "Verified", color: "text-green-600", icon: CheckCircle2, bgClass: "bg-green-50 dark:bg-green-950/20" },
  rejected: { label: "Rejected", color: "text-destructive", icon: XCircle, bgClass: "bg-destructive/5" },
  needs_resubmission: { label: "Resubmission Required", color: "text-amber-600", icon: RefreshCw, bgClass: "bg-amber-50 dark:bg-amber-950/20" },
  expired: { label: "Expired", color: "text-muted-foreground", icon: AlertTriangle, bgClass: "bg-muted" },
  suspended: { label: "Suspended", color: "text-destructive", icon: XCircle, bgClass: "bg-destructive/5" },
};

const typeLabels: Record<string, string> = {
  customer: "Buyer / Renter",
  buyer: "Buyer / Renter",
  owner: "Property Owner",
  agent: "Estate Agent",
  agency: "Real Estate Agency",
  api_partner: "API Partner",
};

const UserVerification = () => {
  const { user, accountType } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const accountTypeLabel = accountType ? typeLabels[accountType] || typeLabels.customer : typeLabels.customer;

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("verification_profiles")
        .select("id, verification_type, status, full_legal_name, submitted_at, approved_at, rejected_at, rejection_reason, resubmission_notes, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setVerifications((data as VerificationRecord[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const isVerified = verifications.some((v) => v.status === "approved");

  const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.not_started;

  const canContinue = (status: string) =>
    ["not_started", "in_progress", "awaiting_liveness", "awaiting_documents", "needs_resubmission", "rejected"].includes(status);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" />
          Identity Verification
        </h1>
        <p className="text-muted-foreground font-body text-sm">
          Verify your identity as a <span className="text-foreground font-semibold">{accountTypeLabel}</span> to access all PropatiHub features.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Overall Status Card */}
          <Card className={isVerified ? "border-green-500/30" : "border-amber-500/30"}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isVerified ? "bg-green-100 dark:bg-green-950/30" : "bg-amber-100 dark:bg-amber-950/30"}`}>
                  {isVerified ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  ) : (
                    <ShieldAlert className="w-7 h-7 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {isVerified ? `${accountTypeLabel} Verified` : "Verification Required"}
                  </h2>
                  <p className="text-sm font-body text-muted-foreground">
                    {isVerified
                      ? `Your ${accountTypeLabel} identity has been verified. You have full access to PropatiHub features.`
                      : `Complete your ${accountTypeLabel} verification to unlock bidding, property listing, and more.`}
                  </p>
                </div>
                {!isVerified && (
                  <Button onClick={() => navigate("/verify")} className="gap-2 shrink-0">
                    Verify Now <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Records */}
          {verifications.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-display text-base font-semibold text-foreground">Your Verification Records</h3>
              {verifications.map((v) => {
                const info = getStatusInfo(v.status);
                const StatusIcon = info.icon;
                return (
                  <Card key={v.id} className="overflow-hidden">
                    <div className={`px-5 py-4 ${info.bgClass}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${info.color}`} />
                          <div>
                            <p className="font-body text-sm font-semibold text-foreground">
                              {typeLabels[v.verification_type] || v.verification_type}
                            </p>
                            <Badge variant="outline" className={`text-xs mt-1 ${info.color} border-current/20`}>
                              {info.label}
                            </Badge>
                          </div>
                        </div>
                        {canContinue(v.status) && (
                          <Button size="sm" variant="outline" onClick={() => navigate("/verify")} className="gap-1.5">
                            {v.status === "rejected" || v.status === "needs_resubmission" ? "Resubmit" : "Continue"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="py-3 px-5">
                      <div className="grid grid-cols-2 gap-3 text-xs font-body">
                        {v.full_legal_name && (
                          <div>
                            <span className="text-muted-foreground">Name:</span>{" "}
                            <span className="text-foreground font-medium">{v.full_legal_name}</span>
                          </div>
                        )}
                        {v.submitted_at && (
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{" "}
                            <span className="text-foreground">{new Date(v.submitted_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {v.approved_at && (
                          <div>
                            <span className="text-muted-foreground">Approved:</span>{" "}
                            <span className="text-green-600">{new Date(v.approved_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {v.rejected_at && (
                          <div>
                            <span className="text-muted-foreground">Rejected:</span>{" "}
                            <span className="text-destructive">{new Date(v.rejected_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {v.rejection_reason && (
                        <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                          <p className="text-xs font-body text-destructive font-medium">Reason: {v.rejection_reason}</p>
                        </div>
                      )}
                      {v.resubmission_notes && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/10 rounded-lg border border-amber-500/10">
                          <p className="text-xs font-body text-amber-700 dark:text-amber-400 font-medium">Note: {v.resubmission_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-display text-base font-semibold text-foreground mb-1">No verification on file</h3>
                <p className="text-sm font-body text-muted-foreground mb-4 max-w-sm mx-auto">
                  You haven't started the identity verification process yet. Complete it to access all features.
                </p>
                <Button onClick={() => navigate("/verify")} className="gap-2">
                  Start Verification <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* What you can do section */}
          <Card>
            <CardHeader><CardTitle className="text-base">What verification unlocks</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Place bids on properties", verified: isVerified },
                  { label: "List properties for sale/rent", verified: isVerified },
                  { label: "Send messages to agents", verified: isVerified },
                  { label: "Submit property inquiries", verified: isVerified },
                  { label: "Access tenant portal", verified: isVerified },
                  { label: "Save favourite properties", verified: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm font-body">
                    {item.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={item.verified ? "text-foreground" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserVerification;
