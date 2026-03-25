import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserFavourites = () => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavourites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("*, properties(title, city, state, price, images, bedrooms, bathrooms)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavourites(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFavourites(); }, [user]);

  const removeFavourite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    toast({ title: "Removed from favourites" });
    fetchFavourites();
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Favourites</h1>
        <p className="text-muted-foreground font-body text-sm">{favourites.length} saved properties</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favourites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body mb-2">No favourites yet</p>
            <p className="text-sm text-muted-foreground font-body">Browse properties and tap the heart icon to save them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favourites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {fav.properties?.images?.[0] && <img src={fav.properties.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground text-sm truncate">{fav.properties?.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">{fav.properties?.city}, {fav.properties?.state}</p>
                  <p className="text-sm font-display font-bold text-accent mt-0.5">{formatPrice(fav.properties?.price || 0)}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeFavourite(fav.id)}>
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

export default UserFavourites;
