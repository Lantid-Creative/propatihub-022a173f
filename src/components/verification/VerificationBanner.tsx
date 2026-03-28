import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVerificationStatus } from "@/hooks/useVerification";
import type { VerificationType } from "@/types/verification";
import { STATUS_LABELS } from "@/types/verification";

interface VerificationBannerProps {
  type: VerificationType;
}

const VerificationBanner = ({ type }: VerificationBannerProps) => {
  const { status, isVerified, loading } = useVerificationStatus(type);

  if (loading) {
    return (
      <Card className="mb-6 border-muted/50 bg-muted/5">
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Checking verification status...</span>
        </CardContent>
      </Card>
    );
  }

  // If approved, show a subtle success indicator
  if (isVerified) {
    return (
      <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 dark:bg-green-500/10 shadow-sm shadow-green-500/5">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span className="font-body text-xs font-semibold text-green-700 dark:text-green-400">
          Account Verified — You have full access to all professional features
        </span>
      </div>
    );
  }

  // Pending Review
  if (status === "pending_review" || status === "under_manual_review") {
    return (
      <Card className="mb-6 border-blue-500/30 bg-blue-500/[0.02] dark:bg-blue-950/10 shadow-lg shadow-blue-500/5">
        <CardContent className="py-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-foreground">Verification Under Review</h3>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Our compliance team is currently reviewing your documents. This typically takes less than 24 hours.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                Pending
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Action Required (Rejected or Needs Resubmission)
  if (status === "rejected" || status === "needs_resubmission") {
    return (
      <Card className="mb-6 border-destructive/30 bg-destructive/5 shadow-lg shadow-destructive/5">
        <CardContent className="py-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-destructive">Verification Action Required</h3>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                There was an issue with your submission. Please review findings and resubmit your details.
              </p>
            </div>
            <Link to="/dashboard/verification" className="w-full sm:w-auto">
              <Button variant="destructive" size="sm" className="w-full gap-2 font-bold shadow-lg shadow-destructive/20 transition-all hover:scale-105 active:scale-95">
                Fix Verification <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not started or In progress
  return (
    <Card className="mb-6 border-amber-500/30 bg-amber-500/[0.02] dark:bg-amber-950/10 shadow-lg shadow-amber-500/5 rounded-2xl overflow-hidden group">
      <CardContent className="py-6 sm:py-5 px-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-foreground">Complete Identity Verification</h3>
            <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed max-w-lg">
              Unlock the full power of PropatiHub. Verified users can list properties, bid on auctions, and message agents directly.
            </p>
          </div>
          <Link to="/dashboard/verification" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 gap-2 font-display font-bold shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5">
              Verify Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationBanner;
