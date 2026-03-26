import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, Search, Building2, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

const AdminProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("properties").update({ status }).eq("id", id);
    toast({ title: `Property marked as ${status}` });
    fetchProperties();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesType = typeFilter === "all" || p.property_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusCounts: Record<string, number> = {};
  properties.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Property Moderation</h1>
        <p className="text-muted-foreground font-body text-sm">{properties.length} total listings</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "pending", "active", "draft", "sold", "rented", "inactive"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
              statusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} {s !== "all" && statusCounts[s] ? `(${statusCounts[s]})` : s === "all" ? `(${properties.length})` : ""}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="short_let">Short Let</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter === "pending" && filtered.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const ids = filtered.map(p => p.id);
              for (const id of ids) {
                await supabase.from("properties").update({ status: "active" }).eq("id", id);
              }
              toast({ title: `${ids.length} properties approved` });
              fetchProperties();
            }}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Approve All ({filtered.length})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No properties found.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((prop) => (
            <Card key={prop.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(prop)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {prop.images?.[0] ? (
                    <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Building2 className="w-5 h-5 text-muted-foreground" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground text-sm truncate">{prop.title}</h3>
                  <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {prop.city}, {prop.state}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                    {prop.bedrooms && <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /> {prop.bedrooms}</span>}
                    {prop.bathrooms && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" /> {prop.bathrooms}</span>}
                    {prop.area_sqm && <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" /> {prop.area_sqm}m²</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-bold text-accent">{formatPrice(prop.price)}</p>
                  <Badge className={`${statusColors[prop.status] || ""} text-[10px] mt-1`}>{prop.status}</Badge>
                </div>
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {prop.status === "pending" && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "active")} title="Approve">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "inactive")} title="Reject">
                        <XCircle className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {prop.status === "active" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "inactive")} title="Deactivate">
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                  {prop.status === "inactive" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "active")} title="Reactivate">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* Images */}
              {selected.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                  {selected.images.slice(0, 3).map((img: string, i: number) => (
                    <img key={i} src={img} alt="" className={`w-full object-cover rounded-lg ${i === 0 ? "col-span-2 row-span-2 h-48" : "h-[5.75rem]"}`} />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                <div><span className="text-muted-foreground">Price:</span> <span className="font-bold text-accent">{formatPrice(selected.price)}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selected.property_type}</span></div>
                <div><span className="text-muted-foreground">Listing:</span> <span className="capitalize">{selected.listing_type}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[selected.status]}>{selected.status}</Badge></div>
                <div><span className="text-muted-foreground">Location:</span> {selected.address || selected.city}, {selected.state}</div>
                <div><span className="text-muted-foreground">Views:</span> {selected.views_count || 0}</div>
                {selected.bedrooms && <div><span className="text-muted-foreground">Bedrooms:</span> {selected.bedrooms}</div>}
                {selected.bathrooms && <div><span className="text-muted-foreground">Bathrooms:</span> {selected.bathrooms}</div>}
                {selected.area_sqm && <div><span className="text-muted-foreground">Area:</span> {selected.area_sqm}m²</div>}
              </div>

              {selected.description && (
                <p className="text-sm text-muted-foreground font-body border-t border-border pt-3">{selected.description}</p>
              )}

              {selected.features?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selected.features.map((f: string) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-border">
                {selected.status !== "active" && (
                  <Button onClick={() => updateStatus(selected.id, "active")} className="bg-primary hover:bg-primary/90">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                )}
                {selected.status !== "inactive" && (
                  <Button variant="outline" onClick={() => updateStatus(selected.id, "inactive")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="w-4 h-4 mr-2" /> Deactivate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminProperties;
