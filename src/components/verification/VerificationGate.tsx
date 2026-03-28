import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useVerificationStatus } from "@/hooks/useVerification";
import { useAuth } from "@/contexts/AuthContext";
import type { VerificationType } from "@/types/verification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, Loader2, Clock, AlertTriangle } from "lucide-react";

interface VerificationGateProps {
  children: ReactNode;
  verificationType: VerificationType;
  actionLabel?: string;
}

const VerificationGate = ({ children, verificationType, actionLabel = "this feature" }: VerificationGateProps) => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { isVerified, status, loading } = useVerificationStatus(verificationType);

  if (!user) return <>{children}</>;
  if (hasRole("admin")) return <>{children}</>;
  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (isVerified) return <>{children}</>;

  const statusMessages: Record<string, { title: string; desc: string; cta: string }> = {
    not_started: {
      title: "Identity Verification Required",
      desc: `You need to verify your identity before you can access ${actionLabel}. It only takes a few minutes.`,
      cta: "Start Verification",
    },
    in_progress: {
      title: "Complete Your Verification",
      desc: "You started the verification process. Please complete all steps to continue.",
      cta: "Continue Verification",
    },
    pending_review: {
      title: "Verification Under Review",
      desc: "Your verification is being reviewed by our team. This usually takes up to 24 hours.",
      cta: "",
    },
    under_manual_review: {
      title: "Verification Under Review",
      desc: "Your submission is being reviewed by a specialist. We'll notify you once complete.",
      cta: "",
    },
    rejected: {
      title: "Verification Rejected",
      desc: "Your previous verification was not approved. You can resubmit with corrected information.",
      cta: "Resubmit Verification",
    },
    needs_resubmission: {
      title: "Resubmission Required",
      desc: "We need some updates to your verification submission. Please review and resubmit.",
      cta: "Update Verification",
    },
    suspended: {
      title: "Account Suspended",
      desc: "Your verification has been suspended. Please contact support for assistance.",
      cta: "",
    },
  };

  const msg = statusMessages[status] || statusMessages.not_started;
  const isPending = status === "pending_review" || status === "under_manual_review";
  const isRejected = status === "rejected" || status === "needs_resubmission";
  
  const Icon = isPending ? Clock : isRejected ? AlertTriangle : ShieldAlert;
  const colorClass = isPending ? "text-blue-600 dark:text-blue-400" : isRejected ? "text-destructive" : "text-amber-600 dark:text-amber-400";
  const bgClass = isPending ? "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10" : "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10";

  return (
    <Card className={`max-w-lg mx-auto ${bgClass} shadow-lg shadow-black/[0.02]`}>
      <CardContent className="py-10 text-center space-y-5">
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${isPending ? "bg-blue-100 dark:bg-blue-900/30" : "bg-amber-100 dark:bg-amber-950/30"}`}>
          <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display">{msg.title}</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto font-body leading-relaxed">{msg.desc}</p>
        </div>
        {msg.cta ? (
          <Button onClick={() => navigate("/verify")} className="gap-2 h-11 px-8 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {msg.cta} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : isPending && (
          <Button variant="outline" onClick={() => navigate("/dashboard/verification")} className="gap-2">
            View Status <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationGate;
