import { calculateCompletion, getCompletionLevel, type PropertyData } from "@/lib/propertyUtils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ShieldCheck } from "lucide-react";

interface Props {
  data: PropertyData;
  verified?: boolean;
  compact?: boolean;
}

const CompletionBadge = ({ data, verified = false, compact = false }: Props) => {
  const { percentage, missing, filled, total } = calculateCompletion(data);
  const level = getCompletionLevel(percentage);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {verified && (
          <Badge className="bg-primary/10 text-primary text-[10px] gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified
          </Badge>
        )}
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${percentage >= 95 ? "bg-primary" : percentage >= 70 ? "bg-accent" : percentage >= 40 ? "bg-blue-500" : "bg-muted-foreground"}`} />
          <span className="text-[10px] font-body text-muted-foreground">{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${level.border} ${level.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-body font-semibold ${level.color}`}>{level.level}</span>
          <span className="text-xs text-muted-foreground font-body">{filled}/{total} fields</span>
        </div>
        <div className="flex items-center gap-2">
          {verified && (
            <Badge className="bg-primary/10 text-primary text-[10px] gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          )}
          <span className={`text-lg font-display font-bold ${level.color}`}>{percentage}%</span>
        </div>
      </div>
      <Progress value={percentage} className="h-2 mb-3" />

      {missing.length > 0 && missing.length <= 8 && (
        <div>
          <p className="text-[10px] text-muted-foreground font-body mb-1.5">Missing for higher completion:</p>
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 6).map((m) => (
              <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground font-body flex items-center gap-0.5">
                <Circle className="w-2 h-2" /> {m}
              </span>
            ))}
            {missing.length > 6 && (
              <span className="text-[9px] text-muted-foreground font-body">+{missing.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {percentage >= 95 && !verified && (
        <p className="text-[10px] text-primary font-body mt-2 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Ready for verification — request admin approval
        </p>
      )}
    </div>
  );
};

export default CompletionBadge;
