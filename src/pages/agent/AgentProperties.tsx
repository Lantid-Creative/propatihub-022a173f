import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, Edit, Search, MapPin, ExternalLink, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  title: "", description: "", property_type: "house" as const, listing_type: "sale" as const,
  price: "", bedrooms: "", bathrooms: "", area_sqm: "", address: "", city: "", state: "Lagos",
  features: "", images: "",
};

const AgentProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleCreate = async () => {
    if (!user || !form.title || !form.city || !form.price) {
      toast({ title: "Missing fields", description: "Title, city, and price are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("properties").insert({
      agent_id: user.id,
      title: form.title,
      description: form.description || null,
      property_type: form.property_type,
      listing_type: form.listing_type,
      price: parseInt(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || null,
      bathrooms: parseInt(form.bathrooms) || null,
      area_sqm: parseInt(form.area_sqm) || null,
      address: form.address || null,
      city: form.city,
      state: form.state,
      features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : null,
      images: form.images ? form.images.split(",").map((f) => f.trim()).filter(Boolean) : null,
      status: "pending",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property created!", description: "Submitted for review." });
      setCreateOpen(false);
      setForm({ ...emptyForm });
      fetchProperties();
    }
  };

  const handleEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from("properties").update({
      title: form.title,
      description: form.description || null,
      property_type: form.property_type,
      listing_type: form.listing_type,
      price: parseInt(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || null,
      bathrooms: parseInt(form.bathrooms) || null,
      area_sqm: parseInt(form.area_sqm) || null,
      address: form.address || null,
      city: form.city,
      state: form.state,
      features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : null,
      images: form.images ? form.images.split(",").map((f) => f.trim()).filter(Boolean) : null,
    }).eq("id", editId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property updated!" });
      setEditOpen(false);
      setEditId(null);
      fetchProperties();
    }
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
      images: (p.images || []).join(", "),
    });
    setEditOpen(true);
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    await supabase.from("properties").delete().eq("id", id);
    toast({ title: "Property deleted" });
    fetchProperties();
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "inactive" : current === "draft" ? "pending" : "active";
    await supabase.from("properties").update({ status: next }).eq("id", id);
    toast({ title: `Property ${next}` });
    fetchProperties();
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
    inactive: properties.filter((p) => p.status === "inactive" || p.status === "sold" || p.status === "rented").length,
  };

  const PropertyForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-body font-medium block mb-1">Title *</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="5-Bedroom Detached Duplex in Lekki" />
      </div>
      <div>
        <label className="text-sm font-body font-medium block mb-1">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property in detail..." rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-body font-medium block mb-1">Price (₦) *</label>
        <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="50000000" />
      </div>
      <div className="grid grid-cols-3 gap-3">
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
      <div>
        <label className="text-sm font-body font-medium block mb-1">Address</label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Admiralty Way" />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
      <div>
        <label className="text-sm font-body font-medium block mb-1">Features (comma-separated)</label>
        <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Swimming Pool, Generator, BQ, CCTV" />
      </div>
      <div>
        <label className="text-sm font-body font-medium block mb-1">Image URLs (comma-separated)</label>
        <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" rows={2} />
        <p className="text-[10px] text-muted-foreground font-body mt-1">Paste direct image URLs separated by commas</p>
      </div>
      <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground font-body text-sm">{properties.length} properties · {counts.active} active</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (o) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Property</DialogTitle>
            </DialogHeader>
            <PropertyForm onSubmit={handleCreate} submitLabel="Create Listing" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
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
          <PropertyForm onSubmit={handleEdit} submitLabel="Save Changes" />
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
          {filtered.map((p) => (
            <Card key={p.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-body font-semibold text-foreground text-sm truncate">{p.title}</h3>
                        <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {p.city}, {p.state}
                        </p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-base font-display font-bold text-accent">{fmt(p.price)}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views_count || 0}</span>
                        {p.bedrooms && <span>{p.bedrooms} bed</span>}
                        {p.bathrooms && <span>{p.bathrooms} bath</span>}
                        {p.area_sqm && <span>{p.area_sqm}m²</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
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
                    {(p.status === "active" || p.status === "inactive" || p.status === "draft") && (
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggleStatus(p.id, p.status)}>
                        {p.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs text-destructive hover:text-destructive" onClick={() => deleteProperty(p.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentProperties;
