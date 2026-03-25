import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  draft: "bg-muted text-muted-foreground",
  sold: "bg-destructive/10 text-destructive",
  rented: "bg-green-light/10 text-green-light",
  inactive: "bg-muted text-muted-foreground",
};

const AdminProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*, profiles!properties_agent_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("properties").update({ status }).eq("id", id);
    toast({ title: `Property ${status}` });
    fetchProperties();
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">All Properties</h1>
          <p className="text-muted-foreground font-body text-sm">{properties.length} total listings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground font-body">No properties listed yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {properties.map((prop) => (
            <Card key={prop.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {prop.images?.[0] && <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground text-sm truncate">{prop.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">{prop.city}, {prop.state}</p>
                  <p className="text-sm font-display font-bold text-accent mt-0.5">{formatPrice(prop.price)}</p>
                </div>
                <Badge className={statusColors[prop.status] || ""}>{prop.status}</Badge>
                <div className="flex gap-1">
                  {prop.status === "pending" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "active")} title="Approve">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                  {prop.status === "active" && (
                    <Button size="icon" variant="ghost" onClick={() => updateStatus(prop.id, "inactive")} title="Deactivate">
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminProperties;
