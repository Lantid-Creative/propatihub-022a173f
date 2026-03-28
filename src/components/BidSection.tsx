import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, TrendingUp, Users, Clock, ShieldCheck, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import AuctionCountdown from "./AuctionCountdown";
import KYCVerificationCard from "./KYCVerificationCard";

interface BidSectionProps {
  propertyId: string;
  askingPrice: number;
  reservePrice?: number;
  auctionEndAt?: string;
  auctionStartAt?: string;
  auctionStatus?: string;
  depositPercentage?: number;
  winnerPaymentDays?: number;
}

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  status: string;
  created_at: string;
  is_winner?: boolean;
  profile?: { full_name: string | null };
}

const BidSection = ({
  propertyId,
  askingPrice,
  reservePrice,
  auctionEndAt,
  auctionStartAt,
  auctionStatus,
  depositPercentage = 5,
  winnerPaymentDays = 7,
}: BidSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string>("none");
  const [kycLoading, setKycLoading] = useState(true);

  // Check KYC status via verification_profiles
  useEffect(() => {
    if (!user) { setKycLoading(false); return; }
    const checkKyc = async () => {
      const { data } = await supabase
        .from("verification_profiles")
        .select("status")
        .eq("user_id", user.id)
        .eq("verification_type", "customer")
        .maybeSingle();
      setKycStatus(data?.status === "approved" ? "verified" : (data?.status || "none"));
      setKycLoading(false);
    };
    checkKyc();
  }, [user]);

  const fetchBids = async () => {
    const { data } = await supabase
      .from("bids")
      .select("*")
      .eq("property_id", propertyId)
      .eq("status", "active")
      .order("amount", { ascending: false });

    if (data) {
      const bidderIds = [...new Set(data.map((b: any) => b.bidder_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", bidderIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      setBids(
        data.map((b: any) => ({
          ...b,
          profile: profileMap.get(b.bidder_id) || { full_name: "Anonymous" },
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBids();
    const channel = supabase
      .channel(`bids-${propertyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `property_id=eq.${propertyId}` }, () => fetchBids())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [propertyId]);

  const highestBid = bids.length > 0 ? bids[0].amount : 0;
  const totalBids = bids.length;
  const depositAmount = Math.round((highestBid > 0 ? highestBid : askingPrice) * (depositPercentage / 100));
  const auctionEnded = auctionEndAt && new Date(auctionEndAt).getTime() <= Date.now();
  const auctionNotStarted = auctionStartAt && new Date(auctionStartAt).getTime() > Date.now();
  const canBid = !auctionEnded && !auctionNotStarted && kycStatus === "verified";

  const handlePlaceBid = async () => {
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to participate in this auction and place your bid.", 
        variant: "destructive" 
      });
      return;
    }

    if (kycStatus !== "verified") {
      toast({ 
        title: "Identity Verification Required", 
        description: "To ensure a secure bidding environment, please complete your identity verification (KYC) before placing a bid.", 
        variant: "destructive" 
      });
      return;
    }

    const amount = parseInt(bidAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      toast({ 
        title: "Invalid Bid Amount", 
        description: "Please enter a valid numeric amount to place your bid.", 
        variant: "destructive" 
      });
      return;
    }

    if (reservePrice && amount < reservePrice) {
      toast({ 
        title: "Bid Below Reserve Price", 
        description: `Your bid must be at least ₦${reservePrice.toLocaleString()} to meet the seller's reserve price.`, 
        variant: "destructive" 
      });
      return;
    }

    if (highestBid > 0 && amount <= highestBid) {
      toast({ 
        title: "Bid Increment Required", 
        description: `To become the leading bidder, your offer must be higher than the current highest bid of ₦${highestBid.toLocaleString()}.`, 
        variant: "destructive" 
      });
      return;
    }

    setPlacing(true);
    const { error } = await supabase.from("bids").insert({
      property_id: propertyId,
      bidder_id: user.id,
      amount,
    } as any);

    if (error) {
      toast({ 
        title: "Bidding Error", 
        description: error.message || "We encountered an issue while placing your bid. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Bid Placed Successfully", 
        description: `Success! Your bid of ₦${amount.toLocaleString()} has been recorded. You are now the leading bidder.`,
        className: "bg-primary text-primary-foreground border-none",
      });
      setBidAmount("");
      fetchBids();
    }
    setPlacing(false);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Auction Timer */}
      {auctionEndAt && (
        <AuctionCountdown endAt={auctionEndAt} startAt={auctionStartAt} status={auctionStatus} />
      )}

      {/* Bid Summary */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gavel className="w-5 h-5 text-accent" />
            Bidding
            {auctionEnded && <Badge variant="secondary">Ended</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-card rounded-lg">
              <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-accent">
                {highestBid > 0 ? formatPrice(highestBid) : "No bids yet"}
              </p>
              <p className="text-xs font-body text-muted-foreground">Highest Bid</p>
            </div>
            <div className="text-center p-3 bg-card rounded-lg">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-foreground">{totalBids}</p>
              <p className="text-xs font-body text-muted-foreground">Total Bids</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs font-body text-muted-foreground">Asking Price</p>
              <p className="font-display text-sm font-bold text-foreground">{formatPrice(askingPrice)}</p>
            </div>
            {reservePrice && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-body text-muted-foreground">Reserve Price</p>
                <p className="font-display text-sm font-bold text-foreground">{formatPrice(reservePrice)}</p>
              </div>
            )}
          </div>

          {/* Deposit Info */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-start gap-2">
            <Banknote className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-xs font-semibold text-foreground">Refundable Deposit Required</p>
              <p className="font-body text-xs text-muted-foreground">
                {depositPercentage}% deposit ({formatPrice(depositAmount)}) required. Refunded if you don't win. Forfeited if winner defaults.
              </p>
            </div>
          </div>

          {/* Winner Deadline */}
          <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-start gap-2">
            <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-xs font-semibold text-foreground">Winner Payment Deadline</p>
              <p className="font-body text-xs text-muted-foreground">
                {winnerPaymentDays} days to complete payment after winning. Failure forfeits deposit.
              </p>
            </div>
          </div>

          {/* KYC Status */}
          {user && !kycLoading && kycStatus !== "verified" && (
            <KYCVerificationCard onVerified={() => setKycStatus("pending")} />
          )}
          {user && kycStatus === "verified" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/5 rounded-lg border border-green-500/20">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="font-body text-xs text-green-700">Identity Verified — You can bid</span>
            </div>
          )}

          {/* Place Bid */}
          {!auctionEnded && (
            <div className="space-y-3">
              <label className="font-body text-sm font-medium text-foreground block">Place your bid (₦)</label>
              <Input
                type="text"
                value={bidAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setBidAmount(raw ? parseInt(raw).toLocaleString() : "");
                }}
                placeholder={
                  reservePrice && highestBid === 0
                    ? `Min: ${formatPrice(reservePrice)}`
                    : highestBid > 0
                    ? `Min: ${formatPrice(highestBid + 1)}`
                    : `e.g. ${formatPrice(askingPrice)}`
                }
                className="text-lg font-display font-bold"
                disabled={!canBid}
              />
              <Button
                onClick={handlePlaceBid}
                disabled={placing || !bidAmount || !canBid}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                <Gavel className="w-4 h-4 mr-2" />
                {placing ? "Placing bid..." : auctionNotStarted ? "Auction not started" : !user ? "Sign in to bid" : kycStatus !== "verified" ? "Complete KYC first" : "Place Bid"}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  <Link to="/auth" className="text-accent hover:underline">Sign in</Link> to place a bid
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bid History */}
      {bids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bid History ({totalBids})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {bids.map((bid, i) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    i === 0 ? "bg-accent/10 border border-accent/20" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-display font-bold text-primary">
                        {(bid.profile?.full_name || "A")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {bid.bidder_id === user?.id ? "You" : (bid.profile?.full_name || "Anonymous")}
                      </p>
                      <p className="text-xs font-body text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(bid.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">{formatPrice(bid.amount)}</p>
                    {i === 0 && <Badge className="bg-accent text-accent-foreground text-[10px]">Highest</Badge>}
                    {bid.is_winner && <Badge className="bg-green-600 text-white text-[10px]">Winner</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BidSection;
