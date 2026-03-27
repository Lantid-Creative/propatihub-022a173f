import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  BedDouble, Bath, Maximize, MapPin, Heart, Share2, ArrowLeft,
  CheckCircle, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import logoLight from "@/assets/logo-light.png";
import MortgageCalculator from "@/components/MortgageCalculator";
import PropertyMap from "@/components/PropertyMap";
import BidSection from "@/components/BidSection";
import StartChatButton from "@/components/StartChatButton";

const listingTypeLabels: Record<string, string> = {
  sale: "For Sale",
  rent: "For Rent",
  short_let: "Short Let",
  land: "Land",
  bid: "For Bidding",
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) {
        setProperty(data);
        // Fetch agent profile
        const { data: agentProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.agent_id)
          .single();
        setAgent(agentProfile);
        // Increment views
        await supabase.from("properties").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id);
      }
      setLoading(false);
    };

    const checkFavorite = async () => {
      if (!user || !id) return;
      const { data } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", id).single();
      setIsFavorite(!!data);
    };

    fetchProperty();
    checkFavorite();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favourites.", variant: "destructive" });
      return;
    }
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", id!);
      setIsFavorite(false);
      toast({ title: "Removed from favourites" });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: id! });
      setIsFavorite(true);
      toast({ title: "Added to favourites" });
    }
  };

  const sendInquiry = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to send inquiries.", variant: "destructive" });
      return;
    }
    if (!message.trim()) {
      toast({ title: "Message required", description: "Please write a message.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      user_id: user.id,
      agent_id: property.agent_id,
      property_id: property.id,
      message: message.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Inquiry sent!", description: "The agent will get back to you soon." });
      setMessage("");
    }
    setSending(false);
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Property not found</h1>
          <Link to="/properties" className="text-accent font-body hover:underline">Back to listings</Link>
        </div>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];

  const seoTitle = `${property.title} — ${listingTypeLabels[property.listing_type] || ""} in ${property.city}, ${property.state}`;
  const seoDesc = property.description
    ? property.description.slice(0, 155).replace(/\s+/g, " ").trim()
    : `${property.bedrooms || ""}${property.bedrooms ? "-bedroom " : ""}${property.property_type} ${listingTypeLabels[property.listing_type]?.toLowerCase() || ""} in ${property.city}, ${property.state}. ${formatPrice(property.price)}.`;
  const seoImage = images.length > 0 ? images[0] : undefined;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || seoDesc,
    url: `https://propatihub.lovable.app/property/${property.id}`,
    image: images.length > 0 ? images : undefined,
    datePosted: property.created_at,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "NGN",
      availability: property.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || undefined,
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: "NG",
    },
    ...(property.latitude && property.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: property.latitude,
        longitude: property.longitude,
      },
    } : {}),
    ...(property.area_sqm ? { floorSize: { "@type": "QuantitativeValue", value: property.area_sqm, unitCode: "MTK" } } : {}),
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/property/${property.id}`}
        ogType="article"
        ogImage={seoImage}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/">
              <img src={logoLight} alt="PropatiHub" className="h-7 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFavorite}>
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <div className="relative bg-muted">
          <div className="max-w-7xl mx-auto">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <img src={images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-body text-foreground">
                    {currentImage + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === currentImage ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted h-64 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-accent text-accent-foreground">
                  {listingTypeLabels[property.listing_type] || property.listing_type}
                </Badge>
                <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                {property.featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">{property.title}</h1>
              <p className="text-muted-foreground font-body flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {property.address && `${property.address}, `}{property.city}, {property.state}
              </p>
              <p className="text-3xl font-display font-bold text-accent mt-4">{formatPrice(property.price)}</p>
              <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-2">
                <Eye className="w-3 h-3" /> {property.views_count || 0} views
              </p>
            </div>

            {/* Key Details */}
            {(property.bedrooms || property.bathrooms || property.area_sqm) && (
              <div className="grid grid-cols-3 gap-4">
                {property.bedrooms && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BedDouble className="w-6 h-6 text-accent mx-auto mb-1" />
                      <p className="text-xl font-display font-bold text-foreground">{property.bedrooms}</p>
                      <p className="text-xs font-body text-muted-foreground">Bedrooms</p>
                    </CardContent>
                  </Card>
                )}
                {property.bathrooms && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Bath className="w-6 h-6 text-accent mx-auto mb-1" />
                      <p className="text-xl font-display font-bold text-foreground">{property.bathrooms}</p>
                      <p className="text-xs font-body text-muted-foreground">Bathrooms</p>
                    </CardContent>
                  </Card>
                )}
                {property.area_sqm && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Maximize className="w-6 h-6 text-accent mx-auto mb-1" />
                      <p className="text-xl font-display font-bold text-foreground">{property.area_sqm}</p>
                      <p className="text-xs font-body text-muted-foreground">Sq. Metres</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-foreground font-body text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {property.features?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Features & Amenities</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm font-body text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Agent Card */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Listed by</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-accent font-display font-bold">
                      {(agent?.full_name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground">{agent?.full_name || "Agent"}</p>
                    <p className="text-xs text-muted-foreground font-body">{agent?.city || ""}{agent?.state ? `, ${agent.state}` : ""}</p>
                  </div>
                </div>
                <StartChatButton
                  recipientId={property.agent_id}
                  propertyId={property.id}
                  variant="default"
                  size="default"
                  label="Chat with Agent"
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Inquiry Form */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Send Inquiry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi, I'm interested in "${property.title}". Please share more details.`}
                  rows={4}
                />
                <Button onClick={sendInquiry} disabled={sending} className="w-full">
                  {sending ? "Sending..." : "Send Message"}
                </Button>
                {!user && (
                  <p className="text-xs text-muted-foreground font-body text-center">
                    <Link to="/auth" className="text-accent hover:underline">Sign in</Link> to send inquiries
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Bid Section for bid listings */}
            {property.listing_type === "bid" && (
              <BidSection
                propertyId={property.id}
                askingPrice={property.price}
                reservePrice={property.reserve_price}
                auctionEndAt={property.auction_end_at}
                auctionStartAt={property.auction_start_at}
                auctionStatus={property.auction_status}
                depositPercentage={property.deposit_percentage}
                winnerPaymentDays={property.winner_payment_deadline_days}
              />
            )}

            {/* Map */}
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              address={`${property.address ? property.address + ", " : ""}${property.city}, ${property.state}, Nigeria`}
              title={property.title}
            />

            {/* Mortgage Calculator */}
            {property.listing_type === "sale" && (
              <MortgageCalculator propertyPrice={property.price} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
