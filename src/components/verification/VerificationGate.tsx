import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useVerificationStatus } from "@/hooks/useVerification";
import { useAuth } from "@/contexts/AuthContext";
import type { VerificationType } from "@/types/verification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

interface VerificationGateProps {
  children: ReactNode;
  verificationType: VerificationType;
  actionLabel?: string;
}

const VerificationGate = ({ children, verificationType, actionLabel = "this feature" }: VerificationGateProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isVerified, status, loading } = useVerificationStatus(verificationType);

  if (!user) return <>{children}</>;
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

  return (
    <Card className="max-w-lg mx-auto border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10">
      <CardContent className="py-8 text-center space-y-4">
        <ShieldAlert className="w-14 h-14 text-amber-600 dark:text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold">{msg.title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{msg.desc}</p>
        {msg.cta && (
          <Button onClick={() => navigate("/verify")} className="gap-2">
            {msg.cta} <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationGate;
