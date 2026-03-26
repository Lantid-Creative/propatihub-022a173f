import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, TrendingUp, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface BidSectionProps {
  propertyId: string;
  askingPrice: number;
}

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  status: string;
  created_at: string;
  profile?: { full_name: string | null };
}

const BidSection = ({ propertyId, askingPrice }: BidSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    const { data } = await supabase
      .from("bids")
      .select("*")
      .eq("property_id", propertyId)
      .eq("status", "active")
      .order("amount", { ascending: false });

    if (data) {
      // Fetch bidder profiles
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

    // Subscribe to realtime bid updates
    const channel = supabase
      .channel(`bids-${propertyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `property_id=eq.${propertyId}`,
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);

  const highestBid = bids.length > 0 ? bids[0].amount : 0;
  const totalBids = bids.length;

  const handlePlaceBid = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to place a bid.", variant: "destructive" });
      return;
    }

    const amount = parseInt(bidAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid bid amount.", variant: "destructive" });
      return;
    }

    if (highestBid > 0 && amount <= highestBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than the current highest bid of ₦${highestBid.toLocaleString()}.`,
        variant: "destructive",
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bid placed!", description: `Your bid of ₦${amount.toLocaleString()} has been placed successfully.` });
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
      {/* Bid Summary */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gavel className="w-5 h-5 text-accent" />
            Bidding
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

          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs font-body text-muted-foreground">Asking Price</p>
            <p className="font-display text-lg font-bold text-foreground">{formatPrice(askingPrice)}</p>
          </div>

          {/* Place Bid */}
          <div className="space-y-3">
            <label className="font-body text-sm font-medium text-foreground block">Place your bid (₦)</label>
            <Input
              type="text"
              value={bidAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setBidAmount(raw ? parseInt(raw).toLocaleString() : "");
              }}
              placeholder={highestBid > 0 ? `Min: ₦${(highestBid + 1).toLocaleString()}` : `e.g. ${formatPrice(askingPrice)}`}
              className="text-lg font-display font-bold"
            />
            <Button
              onClick={handlePlaceBid}
              disabled={placing || !bidAmount}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <Gavel className="w-4 h-4 mr-2" />
              {placing ? "Placing bid..." : "Place Bid"}
            </Button>
            {!user && (
              <p className="text-xs text-muted-foreground font-body text-center">
                <Link to="/auth" className="text-accent hover:underline">Sign in</Link> to place a bid
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bid History */}
      {bids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bid History</CardTitle>
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
                    {i === 0 && (
                      <Badge className="bg-accent text-accent-foreground text-[10px]">Highest</Badge>
                    )}
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
