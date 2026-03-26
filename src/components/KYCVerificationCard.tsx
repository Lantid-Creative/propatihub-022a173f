import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

interface KYCVerificationCardProps {
  onVerified?: () => void;
  compact?: boolean;
}

const KYCVerificationCard = ({ onVerified, compact }: KYCVerificationCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("none");
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("kyc_verifications")
        .select("verification_status, bvn_verified, nin_verified")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setStatus(data.verification_status);
      else setStatus("none");
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!bvn && !nin) {
      toast({ title: "Required", description: "Enter your BVN or NIN to proceed.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const payload: any = {
      user_id: user.id,
      verification_status: "pending",
      ...(bvn && { bvn_hash: bvn, bvn_verified: false }),
      ...(nin && { nin_hash: nin, nin_verified: false }),
    };

    const { error } = await supabase.from("kyc_verifications").upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "KYC Submitted", description: "Your identity verification is being processed." });
      setStatus("pending");
      onVerified?.();
    }
    setSubmitting(false);
  };

  if (loading) return null;

  if (status === "verified") {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-body text-sm">KYC Verified</span>
        </div>
      );
    }
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="py-4 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-body text-sm font-semibold text-green-700">Identity Verified</p>
            <p className="font-body text-xs text-muted-foreground">Your BVN/NIN has been verified. You can bid on properties.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="py-4 flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
          <div>
            <p className="font-body text-sm font-semibold text-yellow-700">Verification Pending</p>
            <p className="font-body text-xs text-muted-foreground">Your identity verification is being processed. This may take up to 24 hours.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          KYC Required to Bid
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-body text-xs text-muted-foreground">
          Verify your identity with your BVN or NIN before placing bids. This protects all parties.
        </p>
        <div className="space-y-2">
          <Input
            placeholder="Bank Verification Number (BVN)"
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
            maxLength={11}
          />
          <Input
            placeholder="National Identification Number (NIN)"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
            maxLength={11}
          />
        </div>
        <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="sm">
          {submitting ? "Submitting..." : "Submit for Verification"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KYCVerificationCard;
