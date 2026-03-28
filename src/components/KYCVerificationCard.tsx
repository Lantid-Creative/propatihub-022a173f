import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useVerificationStatus } from "@/hooks/useVerification";

interface KYCVerificationCardProps {
  onVerified?: () => void;
  compact?: boolean;
}

const KYCVerificationCard = ({ compact }: KYCVerificationCardProps) => {
  const { accountType } = useAuth();
  const navigate = useNavigate();
  const verType = (accountType === "buyer" ? "customer" : accountType) as any || "customer";
  const { status, isVerified, loading } = useVerificationStatus(verType);

  if (loading) return null;

  if (isVerified) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-body text-sm">Verified</span>
        </div>
      );
    }
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-green-700">Identity Verified</p>
            <p className="font-body text-xs text-muted-foreground">You have full access to bidding and all professional features.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "pending_review" || status === "under_manual_review") {
    return (
      <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-body text-sm font-semibold text-blue-700">Verification Under Review</p>
            <p className="font-body text-xs text-muted-foreground">We are reviewing your documents. This usually takes less than 24h.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/verification")} className="shrink-0 text-blue-600 hover:text-blue-700">
            Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg shadow-amber-500/5 overflow-hidden">
      <CardContent className="py-5 px-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground">Verification Required</h3>
            <p className="font-body text-xs text-muted-foreground">Complete identity verification to unlock bidding and property listing.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/verify")} className="w-full gap-2 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" size="sm">
          Verify Now <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default KYCVerificationCard;
