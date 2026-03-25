import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AgentInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("inquiries")
      .select("*, properties(title, city), profiles!inquiries_user_id_fkey(full_name, phone)")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    toast({ title: `Inquiry marked as ${status}` });
    fetchInquiries();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Inquiries</h1>
        <p className="text-muted-foreground font-body text-sm">{inquiries.length} inquiries received</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><p className="text-muted-foreground font-body">No inquiries yet. They'll appear here when buyers contact you.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <Card key={inq.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">
                      {inq.profiles?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      Re: {inq.properties?.title} · {inq.profiles?.phone || "No phone"}
                    </p>
                  </div>
                  <Badge variant={inq.status === "pending" ? "secondary" : "default"}>{inq.status}</Badge>
                </div>
                <p className="text-sm text-foreground font-body mb-3">{inq.message}</p>
                {inq.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(inq.id, "responded")}>Mark Responded</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(inq.id, "closed")}>Close</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AgentInquiries;
