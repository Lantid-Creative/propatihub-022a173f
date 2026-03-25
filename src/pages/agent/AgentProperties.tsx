import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const nigerianStates = ["Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Enugu", "Anambra", "Delta", "Kaduna", "Ogun", "Edo", "Ondo", "Kwara", "Osun", "Ekiti", "Imo", "Abia", "Cross River", "Akwa Ibom", "Bayelsa", "Benue", "Borno", "Gombe", "Jigawa", "Kebbi", "Kogi", "Nassarawa", "Niger", "Plateau", "Sokoto", "Taraba", "Yobe", "Zamfara", "Adamawa", "Bauchi", "Ebonyi"];

const AgentProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "", description: "", property_type: "house" as const, listing_type: "sale" as const,
    price: "", bedrooms: "", bathrooms: "", area_sqm: "", address: "", city: "", state: "Lagos",
    features: "",
  });

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
    if (!user) return;
    const { error } = await supabase.from("properties").insert({
      agent_id: user.id,
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      listing_type: form.listing_type,
      price: parseInt(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || null,
      bathrooms: parseInt(form.bathrooms) || null,
      area_sqm: parseInt(form.area_sqm) || null,
      address: form.address,
      city: form.city,
      state: form.state,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      status: "pending",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property created!", description: "It will be reviewed before going live." });
      setDialogOpen(false);
      setForm({ title: "", description: "", property_type: "house", listing_type: "sale", price: "", bedrooms: "", bathrooms: "", area_sqm: "", address: "", city: "", state: "Lagos", features: "" });
      fetchProperties();
    }
  };

  const deleteProperty = async (id: string) => {
    await supabase.from("properties").delete().eq("id", id);
    toast({ title: "Property deleted" });
    fetchProperties();
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground font-body text-sm">{properties.length} properties</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Property</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="5-Bedroom Detached Duplex" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the property..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-body font-medium block mb-1">Type</label>
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
                  <label className="text-sm font-body font-medium block mb-1">Listing</label>
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
                <label className="text-sm font-body font-medium block mb-1">Price (₦)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="50000000" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-body font-medium block mb-1">Beds</label>
                  <Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-body font-medium block mb-1">Baths</label>
                  <Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-body font-medium block mb-1">Area (m²)</label>
                  <Input type="number" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Admiralty Way" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-body font-medium block mb-1">City</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lekki" />
                </div>
                <div>
                  <label className="text-sm font-body font-medium block mb-1">State</label>
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
                <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Swimming Pool, Generator, BQ" />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Listing</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground font-body mb-4">You haven't listed any properties yet.</p>
            <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Your First Property</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground text-sm truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">{p.city}, {p.state}</p>
                  <p className="text-sm font-display font-bold text-accent mt-0.5">{formatPrice(p.price)}</p>
                </div>
                <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                <span className="text-xs text-muted-foreground font-body">{p.views_count} views</span>
                <Button size="icon" variant="ghost" onClick={() => deleteProperty(p.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentProperties;
