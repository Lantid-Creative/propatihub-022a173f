import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AgencyProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: ag } = await supabase.from("agencies").select("id").eq("owner_id", user.id).single();
      if (ag) {
        const { data } = await supabase.from("properties").select("*").eq("agency_id", ag.id).order("created_at", { ascending: false });
        setProperties(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Agency Properties</h1>
        <p className="text-muted-foreground font-body text-sm">{properties.length} listings</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No agency properties yet. Your agents' listings will appear here.</p></CardContent></Card>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgencyProperties;
