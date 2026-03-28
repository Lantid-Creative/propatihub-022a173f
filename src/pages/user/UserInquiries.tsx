import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VerificationGate from "@/components/verification/VerificationGate";

const UserInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("*, properties(title, city)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setInquiries(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <VerificationGate verificationType="customer" actionLabel="inquiries">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Inquiries</h1>
        <p className="text-muted-foreground font-body text-sm">{inquiries.length} inquiries sent</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">You haven't sent any inquiries yet. Browse properties and contact agents to get started.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inq) => (
            <Card key={inq.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">{inq.properties?.title}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{inq.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={inq.status === "pending" ? "secondary" : "default"}>{inq.status}</Badge>
                    <span className="text-xs text-muted-foreground font-body">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </VerificationGate>
    </DashboardLayout>
  );
};

export default UserInquiries;
