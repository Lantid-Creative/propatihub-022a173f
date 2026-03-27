import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, TrendingUp, Users, Clock, MapPin, Bed, Bath, Maximize } from "lucide-react";
import AuctionCountdown from "./AuctionCountdown";

interface BidProperty {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  images: string[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  property_type: string;
  reserve_price: number | null;
  auction_end_at: string | null;
  auction_start_at: string | null;
  auction_status: string | null;
  bid_count: number;
  highest_bid: number;
}

interface LiveBidPropertiesProps {
  searchQuery?: string;
  minBeds?: string;
  maxPrice?: string;
}

const LiveBidProperties = ({ searchQuery, minBeds, maxPrice }: LiveBidPropertiesProps = {}) => {
  const [properties, setProperties] = useState<BidProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    // Fetch bid-type active properties
    let q = supabase
      .from("properties")
      .select("id, title, price, city, state, images, bedrooms, bathrooms, area_sqm, property_type, reserve_price, auction_end_at, auction_start_at, auction_status")
      .eq("listing_type", "bid")
      .eq("status", "active");

    if (searchQuery) {
      q = q.or(`city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }
    if (minBeds) {
      q = q.gte("bedrooms", parseInt(minBeds));
    }
    if (maxPrice) {
      q = q.lte("price", parseInt(maxPrice));
    }

    const { data: props } = await q
      .order("created_at", { ascending: false })
      .limit(12);

    if (!props || props.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    // Fetch bid counts and highest bids for all properties
    const propertyIds = props.map((p) => p.id);
    const { data: bids } = await supabase
      .from("bids")
      .select("property_id, amount")
      .in("property_id", propertyIds)
      .eq("status", "active");

    const bidMap = new Map<string, { count: number; highest: number }>();
    for (const bid of bids || []) {
      const existing = bidMap.get(bid.property_id) || { count: 0, highest: 0 };
      existing.count++;
      if (bid.amount > existing.highest) existing.highest = bid.amount;
      bidMap.set(bid.property_id, existing);
    }

    setProperties(
      props.map((p: any) => ({
        ...p,
        bid_count: bidMap.get(p.id)?.count || 0,
        highest_bid: bidMap.get(p.id)?.highest || 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();

    // Realtime subscription for bid updates
    const channel = supabase
      .channel("live-bid-properties")
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, () => fetchProperties())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `₦${(price / 1_000_000_000).toFixed(1)}B`;
    if (price >= 1_000_000) return `₦${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `₦${(price / 1_000).toFixed(0)}K`;
    return `₦${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Live Bidding Properties
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">No live auctions right now</h2>
          <p className="font-body text-muted-foreground mb-6">
            Check back soon or search for upcoming bidding properties.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Live Bidding Properties
          </h2>
          <p className="font-body text-muted-foreground">
            {properties.length} properties available for bidding right now
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const auctionEnded = property.auction_end_at && new Date(property.auction_end_at).getTime() <= Date.now();
            return (
              <Link to={`/property/${property.id}`} key={property.id} className="group">
                <Card className="overflow-hidden border-border hover:border-accent/40 transition-all hover:shadow-lg">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gavel className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        <Gavel className="w-3 h-3 mr-1" /> Bidding
                      </Badge>
                      {auctionEnded && (
                        <Badge variant="secondary" className="text-xs">Ended</Badge>
                      )}
                    </div>

                    {/* Bid count overlay */}
                    <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-accent" />
                      <span className="font-display text-xs font-bold text-foreground">{property.bid_count} bids</span>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Title & Location */}
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                        {property.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {property.city}, {property.state}
                      </p>
                    </div>

                    {/* Property specs */}
                    <div className="flex items-center gap-3 text-xs font-body text-muted-foreground">
                      {property.bedrooms != null && (
                        <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {property.bedrooms}</span>
                      )}
                      {property.bathrooms != null && (
                        <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.bathrooms}</span>
                      )}
                      {property.area_sqm != null && (
                        <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {property.area_sqm}m²</span>
                      )}
                    </div>

                    {/* Price & Highest Bid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted rounded-lg p-2.5">
                        <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Asking</p>
                        <p className="font-display text-sm font-bold text-foreground">{formatPrice(property.price)}</p>
                      </div>
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-2.5">
                        <p className="text-[10px] font-body text-accent uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Highest
                        </p>
                        <p className="font-display text-sm font-bold text-accent">
                          {property.highest_bid > 0 ? formatPrice(property.highest_bid) : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Auction Timer */}
                    {property.auction_end_at && !auctionEnded && (
                      <AuctionCountdown
                        endAt={property.auction_end_at}
                        startAt={property.auction_start_at || undefined}
                        status={property.auction_status || undefined}
                      />
                    )}
                    {!property.auction_end_at && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/50 text-xs font-body text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Open bidding — no time limit
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LiveBidProperties;
