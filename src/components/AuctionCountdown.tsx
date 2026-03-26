import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuctionCountdownProps {
  endAt: string;
  startAt?: string;
  status?: string;
}

const AuctionCountdown = ({ endAt, startAt, status }: AuctionCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical" | "ended">("normal");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(endAt).getTime();
      const start = startAt ? new Date(startAt).getTime() : 0;

      if (start > now) {
        const diff = start - now;
        setTimeLeft(formatDiff(diff));
        setUrgency("normal");
        return;
      }

      if (end <= now) {
        setTimeLeft("Auction ended");
        setUrgency("ended");
        return;
      }

      const diff = end - now;
      setTimeLeft(formatDiff(diff));

      if (diff < 5 * 60 * 1000) setUrgency("critical");
      else if (diff < 60 * 60 * 1000) setUrgency("warning");
      else setUrgency("normal");
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endAt, startAt]);

  const formatDiff = (ms: number) => {
    const days = Math.floor(ms / 86400000);
    const hrs = Math.floor((ms % 86400000) / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);

    if (days > 0) return `${days}d ${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const colors = {
    normal: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse",
    ended: "bg-muted text-muted-foreground border-border",
  };

  const notStarted = startAt && new Date(startAt).getTime() > Date.now();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors[urgency]}`}>
      {urgency === "critical" ? (
        <AlertTriangle className="w-4 h-4 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 shrink-0" />
      )}
      <div className="flex-1">
        <p className="font-body text-xs text-muted-foreground">
          {notStarted ? "Starts in" : urgency === "ended" ? "Status" : "Time remaining"}
        </p>
        <p className="font-display text-sm font-bold">{timeLeft}</p>
      </div>
      {urgency === "critical" && (
        <Badge variant="destructive" className="text-[10px]">Ending soon!</Badge>
      )}
    </div>
  );
};

export default AuctionCountdown;
