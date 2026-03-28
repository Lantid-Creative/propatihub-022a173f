import { ShieldCheck } from "lucide-react";
import { useVerificationStatus } from "@/hooks/useVerification";
import type { VerificationType } from "@/types/verification";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/verification";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgeProps {
  verificationType: VerificationType;
  compact?: boolean;
}

const VerificationBadge = ({ verificationType, compact }: VerificationBadgeProps) => {
  const { isVerified, status, loading } = useVerificationStatus(verificationType);

  if (loading) return null;

  if (compact && isVerified) {
    return (
      <div className="flex items-center gap-1.5 text-green-600">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-medium">Verified</span>
      </div>
    );
  }

  return (
    <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-muted"} border-0 font-medium`}>
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
    </Badge>
  );
};

export default VerificationBadge;
