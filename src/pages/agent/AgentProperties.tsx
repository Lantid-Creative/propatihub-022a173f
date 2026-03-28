import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, Edit, Search, MapPin, ExternalLink, Building2, ShieldCheck, Image as ImageIcon, Video, FileImage, Loader2, Play, Pause, Square, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";
import CompletionBadge from "@/components/CompletionBadge";
import { calculateCompletion, type PropertyData } from "@/lib/propertyUtils";

const nigerianStates = ["Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Enugu", "Anambra", "Delta", "Kaduna", "Ogun", "Edo", "Ondo", "Kwara", "Osun", "Ekiti", "Imo", "Abia", "Cross River", "Akwa Ibom", "Bayelsa", "Benue", "Borno", "Gombe", "Jigawa", "Kebbi", "Kogi", "Nassarawa", "Niger", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara", "Adamawa", "Bauchi", "Ebonyi"];

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

const emptyForm = {
  title: "", description: "", property_type: "house" as const, listing_type: "sale" as string,
  price: "", bedrooms: "", bathrooms: "", area_sqm: "", address: "", city: "", state: "Lagos",
  features: "", images: [] as string[], floor_plan_url: "", virtual_tour_url: "",
  virtual_tour_video_url: "", year_built: "", parking_spaces: "", furnishing: "",
  condition: "", service_charge: "", caution_fee: "",
  // Auction fields
  reserve_price: "", auction_start_at: "", auction_end_at: "",
  deposit_percentage: "5", winner_payment_deadline_days: "7",
  auction_auto_extend: true, auction_extend_minutes: "5",
  // NYSC fields
  nysc_friendly: false, nysc_details: "",
};

type FormData = typeof emptyForm;

const AgentProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const { toast } = useToast();

  const fetchProperties = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [user]);

  const formToPropertyData = (f: FormData): PropertyData => ({
    title: f.title,
    description: f.description,
    price: parseInt(f.price) || 0,
    property_type: f.property_type,
    listing_type: f.listing_type,
    city: f.city,
    state: f.state,
    address: f.address,
    bedrooms: parseInt(f.bedrooms) || null,
    bathrooms: parseInt(f.bathrooms) || null,
    area_sqm: parseInt(f.area_sqm) || null,
    images: f.images.length > 0 ? f.images : null,
    features: f.features ? f.features.split(",").map(s => s.trim()).filter(Boolean) : null,
    floor_plan_url: f.floor_plan_url || null,
    virtual_tour_url: f.virtual_tour_url || null,
    virtual_tour_video_url: f.virtual_tour_video_url || null,
    year_built: parseInt(f.year_built) || null,
    parking_spaces: parseInt(f.parking_spaces) || null,
    furnishing: f.furnishing || null,
    condition: f.condition || null,
    service_charge: parseFloat(f.service_charge) || null,
  });

  const handleSave = async (isEdit: boolean) => {
    if (!user || !form.title || !form.city || !form.price) {
      toast({ 
        title: "Required Fields Missing", 
        description: "Please provide a title, city, and price to proceed with your listing.", 
        variant: "destructive" 
      });
      return;
    }
    setSubmitting(true);

    const propData = formToPropertyData(form);
    const { percentage } = calculateCompletion(propData);

    const payload = {
      agent_id: user.id,
      title: form.title,
      description: form.description || null,
      property_type: form.property_type as any,
      listing_type: form.listing_type as any,
      price: parseInt(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || null,
      bathrooms: parseInt(form.bathrooms) || null,
      area_sqm: parseInt(form.area_sqm) || null,
      address: form.address || null,
      city: form.city,
      state: form.state,
      features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : null,
      images: form.images.length > 0 ? form.images : null,
      floor_plan_url: form.floor_plan_url || null,
      virtual_tour_url: form.virtual_tour_url || null,
      virtual_tour_video_url: form.virtual_tour_video_url || null,
      year_built: parseInt(form.year_built) || null,
      parking_spaces: parseInt(form.parking_spaces) || null,
      furnishing: form.furnishing || null,
      condition: form.condition || null,
      service_charge: parseFloat(form.service_charge) || null,
      caution_fee: parseFloat(form.caution_fee) || null,
      completion_percentage: percentage,
      status: "pending" as const,
      nysc_friendly: form.nysc_friendly,
      nysc_details: form.nysc_details || null,
      // Auction fields (only meaningful for bid listings)
      ...(form.listing_type === "bid" ? {
        reserve_price: parseInt(form.reserve_price) || null,
        auction_start_at: form.auction_start_at ? new Date(form.auction_start_at).toISOString() : null,
        auction_end_at: form.auction_end_at ? new Date(form.auction_end_at).toISOString() : null,
        deposit_percentage: parseFloat(form.deposit_percentage) || 5,
        winner_payment_deadline_days: parseInt(form.winner_payment_deadline_days) || 7,
        auction_auto_extend: form.auction_auto_extend,
        auction_extend_minutes: parseInt(form.auction_extend_minutes) || 5,
        auction_status: "upcoming",
      } : {}),
    };

    let error;
    if (isEdit && editId) {
      const { agent_id, status, ...updatePayload } = payload;
      ({ error } = await supabase.from("properties").update(updatePayload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("properties").insert(payload));
    }

    if (error) {
      toast({ 
        title: "Submission Error", 
        description: error.message || "We encountered an issue while saving your property. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: isEdit ? "Property Updated Successfuly" : "Listing Submitted Successfully", 
        description: isEdit ? "Your changes have been saved." : "Your property has been submitted for review. Our team will verify it shortly.",
        className: "bg-primary text-primary-foreground border-none",
      });
      if (isEdit) { setEditOpen(false); setEditId(null); } else { setCreateOpen(false); }
      setForm({ ...emptyForm });
      setFormStep(0);
      fetchProperties();
    }
    setSubmitting(false);
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      property_type: p.property_type,
      listing_type: p.listing_type,
      price: String(p.price || ""),
      bedrooms: String(p.bedrooms || ""),
      bathrooms: String(p.bathrooms || ""),
      area_sqm: String(p.area_sqm || ""),
      address: p.address || "",
      city: p.city || "",
      state: p.state || "Lagos",
      features: (p.features || []).join(", "),
      images: p.images || [],
      floor_plan_url: p.floor_plan_url || "",
      virtual_tour_url: p.virtual_tour_url || "",
      virtual_tour_video_url: p.virtual_tour_video_url || "",
      year_built: String(p.year_built || ""),
      parking_spaces: String(p.parking_spaces || ""),
      furnishing: p.furnishing || "",
      condition: p.condition || "",
      service_charge: String(p.service_charge || ""),
      caution_fee: String(p.caution_fee || ""),
      reserve_price: String(p.reserve_price || ""),
      auction_start_at: p.auction_start_at ? p.auction_start_at.slice(0, 16) : "",
      auction_end_at: p.auction_end_at ? p.auction_end_at.slice(0, 16) : "",
      deposit_percentage: String(p.deposit_percentage ?? "5"),
      winner_payment_deadline_days: String(p.winner_payment_deadline_days ?? "7"),
      auction_auto_extend: p.auction_auto_extend ?? true,
      auction_extend_minutes: String(p.auction_extend_minutes ?? "5"),
      nysc_friendly: p.nysc_friendly ?? false,
      nysc_details: p.nysc_details || "",
    });
    setFormStep(0);
    setEditOpen(true);
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    await supabase.from("properties").delete().eq("id", id);
    toast({ 
      title: "Property Deleted", 
      description: "The listing has been permanently removed from your profile.",
      variant: "destructive"
    });
    fetchProperties();
  };

  const requestVerification = async (id: string) => {
    await supabase.from("properties").update({ status: "pending" }).eq("id", id);
    toast({ 
      title: "Verification Requested", 
      description: "You listing is now in the queue for admin review. You'll be notified once it's approved.",
      className: "bg-primary text-primary-foreground border-none",
    });
    fetchProperties();
  };

  const updateAuctionStatus = async (id: string, newStatus: string) => {
    const updates: Record<string, any> = { auction_status: newStatus };
    if (newStatus === "active") {
      // If no start time set, use now
      const prop = properties.find((p) => p.id === id);
      if (!prop?.auction_start_at) updates.auction_start_at = new Date().toISOString();
    }
    if (newStatus === "ended") {
      updates.auction_end_at = new Date().toISOString();
    }
    const { error } = await supabase.from("properties").update(updates).eq("id", id);
    if (error) {
      toast({ 
        title: "Auction Status Update Failed", 
        description: error.message || "We could not update the auction status at this time.", 
        variant: "destructive" 
      });
    } else {
      const labels: Record<string, string> = { 
        active: "is now live and accepting bids", 
        paused: "has been temporarily paused", 
        ended: "has been finalized", 
        upcoming: "has been reset to upcoming" 
      };
      toast({ 
        title: "Auction Status Updated", 
        description: `The auction ${labels[newStatus] || newStatus}.`,
        className: "bg-primary text-primary-foreground border-none",
      });
      fetchProperties();
    }
  };

  const getAuctionStatusBadge = (status: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      upcoming: { label: "Upcoming", className: "bg-muted text-muted-foreground" },
      active: { label: "Live", className: "bg-primary/10 text-primary" },
      paused: { label: "Paused", className: "bg-accent/10 text-accent" },
      ended: { label: "Ended", className: "bg-destructive/10 text-destructive" },
    };
    const c = config[status || "upcoming"] || config.upcoming;
    return <Badge className={`text-[9px] gap-0.5 ${c.className}`}><Gavel className="w-2.5 h-2.5" /> {c.label}</Badge>;
  };

  const fmt = (price: number) => `₦${price.toLocaleString()}`;

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    pending: properties.filter((p) => p.status === "pending").length,
    draft: properties.filter((p) => p.status === "draft").length,
  };

  const handleFloorPlanUpload = async (files: string[]) => {
    if (files.length > 0) setForm({ ...form, floor_plan_url: files[0] });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    if (file.size > 100 * 1024 * 1024) {
      toast({ 
        title: "Video File Too Large", 
        description: "The maximum allowed size for virtual tour videos is 100MB.", 
        variant: "destructive" 
      });
      return;
    }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("virtual-tours").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("virtual-tours").getPublicUrl(path);
    setForm({ ...form, virtual_tour_video_url: urlData.publicUrl });
    toast({ 
      title: "Video Uploaded Successfully", 
      description: "Your virtual tour video has been processed and added to the listing.",
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  // Multi-step form
  const PropertyForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => {
    const propData = formToPropertyData(form);
    const steps = [
      { label: "Basic Info", icon: "📋" },
      { label: "Details", icon: "🏠" },
      { label: "Photos", icon: "📸" },
      { label: "Media & Extras", icon: "🎥" },
    ];

    return (
      <div className="space-y-4">
        {/* Completion Badge */}
        <CompletionBadge data={propData} />

        {/* Step Indicators */}
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setFormStep(i)}
              className={`flex-1 py-2 px-2 rounded-lg text-center transition-all ${
                formStep === i
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="text-sm">{s.icon}</span>
              <p className="text-[10px] font-body mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Step 0: Basic Info */}
        {formStep === 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-body font-medium block mb-1">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="5-Bedroom Detached Duplex in Lekki" />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Description *</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide a detailed description of the property. Include features, surroundings, and any unique selling points..." rows={5} />
              <p className="text-[10px] text-muted-foreground font-body mt-1">{form.description.length} chars (min 30 for completion)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Property Type *</label>
                <Select value={form.property_type} onValueChange={(v: any) => setForm({ ...form, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Listing Type *</label>
                <Select value={form.listing_type} onValueChange={(v: any) => setForm({ ...form, listing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="bid">Auction / Bid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Price (₦) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="50000000" />
            </div>
            {/* Auction Settings - shown when listing_type is "bid" */}
            {form.listing_type === "bid" && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center gap-2">⚡ Auction Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-body font-medium block mb-1">Reserve Price (₦) — minimum accepted bid</label>
                    <Input type="number" value={form.reserve_price} onChange={(e) => setForm({ ...form, reserve_price: e.target.value })} placeholder="40000000" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-body font-medium block mb-1">Auction Start</label>
                      <Input type="datetime-local" value={form.auction_start_at} onChange={(e) => setForm({ ...form, auction_start_at: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-body font-medium block mb-1">Auction End</label>
                      <Input type="datetime-local" value={form.auction_end_at} onChange={(e) => setForm({ ...form, auction_end_at: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-body font-medium block mb-1">Deposit (%)</label>
                      <Input type="number" value={form.deposit_percentage} onChange={(e) => setForm({ ...form, deposit_percentage: e.target.value })} placeholder="5" />
                    </div>
                    <div>
                      <label className="text-sm font-body font-medium block mb-1">Winner Payment Deadline (days)</label>
                      <Input type="number" value={form.winner_payment_deadline_days} onChange={(e) => setForm({ ...form, winner_payment_deadline_days: e.target.value })} placeholder="7" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={form.auction_auto_extend} onChange={(e) => setForm({ ...form, auction_auto_extend: e.target.checked })} className="rounded border-border" />
                      <label className="text-sm font-body">Auto-extend on late bids</label>
                    </div>
                    <div>
                      <label className="text-sm font-body font-medium block mb-1">Extend by (mins)</label>
                      <Input type="number" value={form.auction_extend_minutes} onChange={(e) => setForm({ ...form, auction_extend_minutes: e.target.value })} placeholder="5" disabled={!form.auction_auto_extend} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div>
              <label className="text-sm font-body font-medium block mb-1">Address *</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Admiralty Way, Lekki Phase 1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">City *</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lekki" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">State *</label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setFormStep(1)} className="w-full">Next: Property Details →</Button>
          </div>
        )}

        {/* Step 1: Property Details */}
        {formStep === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Bedrooms</label>
                <Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} placeholder="4" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Bathrooms</label>
                <Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} placeholder="3" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Area (m²)</label>
                <Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} placeholder="350" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Year Built</label>
                <Input type="number" value={form.year_built} onChange={(e) => setForm({ ...form, year_built: e.target.value })} placeholder="2022" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Parking Spaces</label>
                <Input type="number" value={form.parking_spaces} onChange={(e) => setForm({ ...form, parking_spaces: e.target.value })} placeholder="2" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Furnishing</label>
                <Select value={form.furnishing} onValueChange={(v) => setForm({ ...form, furnishing: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Fully Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Condition</label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Brand New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs-renovation">Needs Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Service Charge (₦/yr)</label>
                <Input type="number" value={form.service_charge} onChange={(e) => setForm({ ...form, service_charge: e.target.value })} placeholder="500000" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Caution Fee (₦)</label>
                <Input type="number" value={form.caution_fee} onChange={(e) => setForm({ ...form, caution_fee: e.target.value })} placeholder="1000000" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Features (comma-separated)</label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Swimming Pool, Generator, BQ, CCTV, Gym, Smart Home, Solar Panel, Water Treatment" rows={3} />
              <p className="text-[10px] text-muted-foreground font-body mt-1">Add at least 2 features for better completion</p>
            </div>

            {/* NYSC Friendly */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.nysc_friendly}
                    onChange={(e) => setForm({ ...form, nysc_friendly: e.target.checked })}
                    className="rounded border-border w-4 h-4"
                  />
                  <div>
                    <label className="text-sm font-body font-medium text-foreground">🎓 NYSC-Friendly Housing</label>
                    <p className="text-[10px] text-muted-foreground font-body">Mark this if the property is suitable for NYSC corps members serving nearby</p>
                  </div>
                </div>
                {form.nysc_friendly && (
                  <div>
                    <label className="text-sm font-body font-medium block mb-1">NYSC Details</label>
                    <Textarea
                      value={form.nysc_details}
                      onChange={(e) => setForm({ ...form, nysc_details: e.target.value })}
                      placeholder="e.g. Close to NYSC secretariat, 10 min to CDS venue, near orientation camp, affordable for corpers, shared apartments available..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(0)} className="flex-1">← Back</Button>
              <Button onClick={() => setFormStep(2)} className="flex-1">Next: Photos →</Button>
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {formStep === 2 && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-body text-foreground font-medium">📸 Photo Requirements</p>
              <ul className="text-xs text-muted-foreground font-body mt-1 space-y-0.5">
                <li>• Minimum resolution: 1200×800 pixels</li>
                <li>• Upload at least 3 photos for a good listing</li>
                <li>• First image will be the cover photo</li>
                <li>• Blurry or low-quality images will be rejected</li>
              </ul>
            </div>

            <ImageUploader
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
              bucket="property-images"
              maxFiles={15}
              label="Property Photos *"
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(1)} className="flex-1">← Back</Button>
              <Button onClick={() => setFormStep(3)} className="flex-1">Next: Media & Extras →</Button>
            </div>
          </div>
        )}

        {/* Step 3: Media & Extras */}
        {formStep === 3 && (
          <div className="space-y-4">
            {/* Floor Plan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><FileImage className="w-4 h-4 text-accent" /> Floor Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {form.floor_plan_url ? (
                  <div className="space-y-2">
                    <img src={form.floor_plan_url} alt="Floor plan" className="w-full rounded-lg border border-border max-h-48 object-contain" />
                    <Button variant="outline" size="sm" onClick={() => setForm({ ...form, floor_plan_url: "" })}>Remove Floor Plan</Button>
                  </div>
                ) : (
                  <ImageUploader
                    images={[]}
                    onChange={(urls) => { if (urls.length > 0) setForm({ ...form, floor_plan_url: urls[0] }); }}
                    bucket="floor-plans"
                    maxFiles={1}
                    minResolution={false}
                    label="Upload Floor Plan"
                  />
                )}
              </CardContent>
            </Card>

            {/* Virtual Tour */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Video className="w-4 h-4 text-accent" /> 360° Virtual Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-body font-medium block mb-1">Tour URL (YouTube, Matterport, etc.)</label>
                  <Input
                    value={form.virtual_tour_url}
                    onChange={(e) => setForm({ ...form, virtual_tour_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://my.matterport.com/..."
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground font-body">— or —</div>
                <div>
                  <label className="text-xs font-body font-medium block mb-1">Upload Video (max 100MB)</label>
                  {form.virtual_tour_video_url ? (
                    <div className="space-y-2">
                      <video src={form.virtual_tour_video_url} controls className="w-full rounded-lg max-h-48" />
                      <Button variant="outline" size="sm" onClick={() => setForm({ ...form, virtual_tour_video_url: "" })}>Remove Video</Button>
                    </div>
                  ) : (
                    <Input type="file" accept="video/*" onChange={handleVideoUpload} />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(2)} className="flex-1">← Back</Button>
              <Button onClick={onSubmit} disabled={submitting} className="flex-1 gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground font-body text-sm">{properties.length} properties · {counts.active} active</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (o) { setForm({ ...emptyForm }); setFormStep(0); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Property</DialogTitle>
            </DialogHeader>
            <PropertyForm onSubmit={() => handleSave(false)} submitLabel="Create Listing" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs">Draft ({counts.draft})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditId(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Property</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={() => handleSave(true)} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Listings */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body mb-2">
              {properties.length === 0 ? "You haven't listed any properties yet." : "No listings match your filter."}
            </p>
            {properties.length === 0 && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-2"><Plus className="w-4 h-4" /> Add Your First Property</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const propData: PropertyData = {
              title: p.title, description: p.description, price: p.price,
              property_type: p.property_type, listing_type: p.listing_type,
              city: p.city, state: p.state, address: p.address,
              bedrooms: p.bedrooms, bathrooms: p.bathrooms, area_sqm: p.area_sqm,
              images: p.images, features: p.features,
              floor_plan_url: p.floor_plan_url, virtual_tour_url: p.virtual_tour_url,
              virtual_tour_video_url: p.virtual_tour_video_url,
              year_built: p.year_built, parking_spaces: p.parking_spaces,
              furnishing: p.furnishing, condition: p.condition, service_charge: p.service_charge,
            };
            const { percentage } = calculateCompletion(propData);

            return (
              <Card key={p.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-body font-semibold text-foreground text-sm truncate">{p.title}</h3>
                            {p.verified && (
                              <Badge className="bg-primary/10 text-primary text-[9px] gap-0.5 shrink-0">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {p.city}, {p.state}
                          </p>
                        </div>
                        <Badge className={`text-xs shrink-0 ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-base font-display font-bold text-accent">{fmt(p.price)}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                          <CompletionBadge data={propData} verified={p.verified} compact />
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auction controls for bid properties */}
                  {p.listing_type === "bid" && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        {getAuctionStatusBadge(p.auction_status)}
                        {p.reserve_price && (
                          <span className="text-[10px] text-muted-foreground">Reserve: {fmt(p.reserve_price)}</span>
                        )}
                        {p.auction_end_at && p.auction_status === "active" && (
                          <span className="text-[10px] text-muted-foreground">
                            Ends: {new Date(p.auction_end_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {(p.auction_status === "upcoming" || p.auction_status === "paused") && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 text-primary" onClick={() => updateAuctionStatus(p.id, "active")}>
                            <Play className="w-3 h-3" /> Start
                          </Button>
                        )}
                        {p.auction_status === "active" && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 text-accent" onClick={() => updateAuctionStatus(p.id, "paused")}>
                            <Pause className="w-3 h-3" /> Pause
                          </Button>
                        )}
                        {(p.auction_status === "active" || p.auction_status === "paused") && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 text-destructive" onClick={() => {
                            if (confirm("End this auction? This will finalize the bidding.")) updateAuctionStatus(p.id, "ended");
                          }}>
                            <Square className="w-3 h-3" /> End
                          </Button>
                        )}
                        {p.auction_status === "ended" && (
                          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1" onClick={() => updateAuctionStatus(p.id, "upcoming")}>
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => openEdit(p)}>
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                      <Link to={`/property/${p.id}`}>
                        <Button size="sm" variant="ghost" className="text-xs gap-1">
                          <ExternalLink className="w-3 h-3" /> View
                        </Button>
                      </Link>
                      {percentage >= 95 && !p.verified && (
                        <Button size="sm" variant="ghost" className="text-xs gap-1 text-primary" onClick={() => requestVerification(p.id)}>
                          <ShieldCheck className="w-3 h-3" /> Request Verification
                        </Button>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs text-destructive hover:text-destructive" onClick={() => deleteProperty(p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentProperties;
