import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, Users, Plus, Mail, Calendar, Banknote, Shield,
  Wrench, FileText, Clock, CheckCircle, AlertTriangle, XCircle,
  Home, ArrowUpRight, ArrowDownLeft, Eye
} from "lucide-react";

const PropertyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tenancies");
  const [properties, setProperties] = useState<any[]>([]);
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [rentPayments, setRentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    property_id: "",
    tenant_email: "",
    tenant_name: "",
    monthly_rent: "",
    caution_fee: "",
    lease_start: "",
    lease_end: "",
    message: "",
  });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);

    // Fetch user's rental properties
    const { data: props } = await supabase
      .from("properties")
      .select("id, title, city, state, images, listing_type, price, bedrooms, bathrooms")
      .eq("agent_id", user!.id)
      .in("listing_type", ["rent", "short_let"] as any[]);

    setProperties(props || []);

    // Fetch tenancies
    const { data: tens } = await supabase
      .from("tenancies")
      .select("*")
      .eq("landlord_id", user!.id)
      .order("created_at", { ascending: false });

    if (tens) {
      // Enrich with property and tenant info
      const propIds = [...new Set(tens.map(t => t.property_id))];
      const tenantIds = [...new Set(tens.map(t => t.tenant_id))];

      const [{ data: propData }, { data: tenantData }] = await Promise.all([
        supabase.from("properties").select("id, title, city, images").in("id", propIds),
        supabase.from("profiles").select("user_id, full_name, phone, avatar_url").in("user_id", tenantIds),
      ]);

      const propMap = new Map(propData?.map(p => [p.id, p]) || []);
      const tenantMap = new Map(tenantData?.map(t => [t.user_id, t]) || []);

      setTenancies(tens.map(t => ({
        ...t,
        property: propMap.get(t.property_id),
        tenant: tenantMap.get(t.tenant_id),
      })));
    }

    // Fetch invitations
    const { data: invs } = await supabase
      .from("tenant_invitations")
      .select("*")
      .eq("invited_by", user!.id)
      .order("created_at", { ascending: false });
    setInvitations(invs || []);

    // Fetch escrows
    const { data: escs } = await supabase
      .from("caution_fee_escrow")
      .select("*")
      .eq("landlord_id", user!.id)
      .order("created_at", { ascending: false });
    setEscrows(escs || []);

    // Fetch maintenance requests
    const { data: maint } = await supabase
      .from("maintenance_requests")
      .select("*")
      .in("tenancy_id", (tens || []).map(t => t.id).length > 0 ? (tens || []).map(t => t.id) : ["none"])
      .order("created_at", { ascending: false });
    setMaintenance(maint || []);

    // Fetch rent payments
    const { data: rents } = await supabase
      .from("rent_payments")
      .select("*")
      .in("tenancy_id", (tens || []).map(t => t.id).length > 0 ? (tens || []).map(t => t.id) : ["none"])
      .order("due_date", { ascending: false });
    setRentPayments(rents || []);

    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteForm.property_id || !inviteForm.tenant_email || !inviteForm.monthly_rent || !inviteForm.caution_fee || !inviteForm.lease_start) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setInviting(true);

    const { error } = await supabase.from("tenant_invitations").insert({
      property_id: inviteForm.property_id,
      invited_by: user!.id,
      tenant_email: inviteForm.tenant_email.trim().toLowerCase(),
      tenant_name: inviteForm.tenant_name || null,
      monthly_rent: parseInt(inviteForm.monthly_rent),
      caution_fee: parseInt(inviteForm.caution_fee),
      lease_start: inviteForm.lease_start,
      lease_end: inviteForm.lease_end || null,
      message: inviteForm.message || null,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitation sent!", description: `Tenant will receive an invitation to ${inviteForm.tenant_email}` });
      setInviteOpen(false);
      setInviteForm({ property_id: "", tenant_email: "", tenant_name: "", monthly_rent: "", caution_fee: "", lease_start: "", lease_end: "", message: "" });
      fetchAll();
    }
    setInviting(false);
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    const { error } = await supabase
      .from("caution_fee_escrow")
      .update({
        escrow_status: "release_requested",
        release_requested_at: new Date().toISOString(),
      } as any)
      .eq("id", escrowId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Release requested", description: "Admin will review and process the caution fee release." });
      fetchAll();
    }
  };

  const handleUpdateMaintenance = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "resolved") updates.resolved_at = new Date().toISOString();

    const { error } = await supabase.from("maintenance_requests").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
      fetchAll();
    }
  };

  const formatPrice = (p: number) => `₦${p.toLocaleString()}`;

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode }> = {
      active: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      pending: { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
      paid: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      held: { color: "bg-blue-100 text-blue-700", icon: <Shield className="w-3 h-3" /> },
      released: { color: "bg-green-100 text-green-700", icon: <ArrowUpRight className="w-3 h-3" /> },
      release_requested: { color: "bg-orange-100 text-orange-700", icon: <Clock className="w-3 h-3" /> },
      open: { color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3 h-3" /> },
      in_progress: { color: "bg-blue-100 text-blue-700", icon: <Wrench className="w-3 h-3" /> },
      resolved: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      expired: { color: "bg-gray-100 text-gray-700", icon: <XCircle className="w-3 h-3" /> },
      accepted: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      declined: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
    };
    const cfg = map[status] || { color: "bg-muted text-muted-foreground", icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${cfg.color}`}>
        {cfg.icon} {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Property Management</h1>
            <p className="text-sm font-body text-muted-foreground">Manage tenants, rentals, escrow, and maintenance</p>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Invite Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Invite a Tenant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Property *</label>
                  <Select value={inviteForm.property_id} onValueChange={(v) => setInviteForm({ ...inviteForm, property_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a rental property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title} — {p.city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Tenant Name</label>
                    <Input value={inviteForm.tenant_name} onChange={(e) => setInviteForm({ ...inviteForm, tenant_name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Tenant Email *</label>
                    <Input type="email" value={inviteForm.tenant_email} onChange={(e) => setInviteForm({ ...inviteForm, tenant_email: e.target.value })} placeholder="tenant@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Monthly Rent (₦) *</label>
                    <Input type="number" value={inviteForm.monthly_rent} onChange={(e) => setInviteForm({ ...inviteForm, monthly_rent: e.target.value })} placeholder="500000" />
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Caution Fee (₦) *</label>
                    <Input type="number" value={inviteForm.caution_fee} onChange={(e) => setInviteForm({ ...inviteForm, caution_fee: e.target.value })} placeholder="1000000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Lease Start *</label>
                    <Input type="date" value={inviteForm.lease_start} onChange={(e) => setInviteForm({ ...inviteForm, lease_start: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Lease End</label>
                    <Input type="date" value={inviteForm.lease_end} onChange={(e) => setInviteForm({ ...inviteForm, lease_end: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Message to tenant</label>
                  <Textarea value={inviteForm.message} onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })} placeholder="Welcome to your new home!" rows={3} />
                </div>
                <Button onClick={handleInvite} disabled={inviting} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="font-display text-2xl font-bold text-foreground">{tenancies.filter(t => t.status === "active").length}</p>
              <p className="text-xs font-body text-muted-foreground">Active Tenants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="font-display text-2xl font-bold text-foreground">{escrows.filter(e => e.escrow_status === "held").length}</p>
              <p className="text-xs font-body text-muted-foreground">Escrow Held</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wrench className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="font-display text-2xl font-bold text-foreground">{maintenance.filter(m => m.status === "open").length}</p>
              <p className="text-xs font-body text-muted-foreground">Open Issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Banknote className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="font-display text-2xl font-bold text-foreground">
                {formatPrice(rentPayments.filter(r => r.status === "paid").reduce((s, r) => s + Number(r.amount), 0))}
              </p>
              <p className="text-xs font-body text-muted-foreground">Rent Collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="tenancies" className="text-xs">Tenancies</TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs">Invitations</TabsTrigger>
            <TabsTrigger value="escrow" className="text-xs">Escrow</TabsTrigger>
            <TabsTrigger value="rent" className="text-xs">Rent</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
          </TabsList>

          {/* Tenancies */}
          <TabsContent value="tenancies">
            {tenancies.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No active tenancies yet. Invite a tenant to get started.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {tenancies.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                            <Home className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-body font-semibold text-foreground text-sm">{t.property?.title || "Property"}</p>
                            <p className="text-xs text-muted-foreground font-body">
                              Tenant: {t.tenant?.full_name || "Unknown"} · {formatPrice(t.monthly_rent)}/mo
                            </p>
                            <p className="text-xs text-muted-foreground font-body">
                              {t.lease_start} → {t.lease_end || "Ongoing"}
                            </p>
                          </div>
                        </div>
                        {statusBadge(t.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invitations */}
          <TabsContent value="invitations">
            {invitations.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No invitations sent yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <Card key={inv.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">{inv.tenant_name || inv.tenant_email}</p>
                          <p className="text-xs text-muted-foreground font-body">{inv.tenant_email}</p>
                          <p className="text-xs text-muted-foreground font-body">
                            Rent: {formatPrice(inv.monthly_rent)} · Caution: {formatPrice(inv.caution_fee)}
                          </p>
                        </div>
                        {statusBadge(inv.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Escrow */}
          <TabsContent value="escrow">
            {escrows.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No caution fee escrows yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {escrows.map((esc) => (
                  <Card key={esc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">
                            {formatPrice(esc.amount)} Caution Fee
                          </p>
                          <p className="text-xs text-muted-foreground font-body">
                            Payment: {statusBadge(esc.payment_status)} · Escrow: {statusBadge(esc.escrow_status)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {esc.escrow_status === "held" && esc.payment_status === "paid" && (
                            <Button size="sm" variant="outline" onClick={() => handleReleaseEscrow(esc.id)}>
                              <ArrowUpRight className="w-3 h-3 mr-1" /> Request Release
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rent Payments */}
          <TabsContent value="rent">
            {rentPayments.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Banknote className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No rent payments recorded yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {rentPayments.map((rp) => (
                  <Card key={rp.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">{formatPrice(rp.amount)}</p>
                          <p className="text-xs text-muted-foreground font-body">
                            Due: {rp.due_date} {rp.paid_date ? `· Paid: ${rp.paid_date}` : ""}
                          </p>
                        </div>
                        {statusBadge(rp.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maintenance */}
          <TabsContent value="maintenance">
            {maintenance.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No maintenance requests yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {maintenance.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">{m.title}</p>
                          <p className="text-xs text-muted-foreground font-body">{m.description?.slice(0, 80)}</p>
                          <p className="text-xs text-muted-foreground font-body mt-1">
                            Priority: <span className="capitalize">{m.priority}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {statusBadge(m.status)}
                          {m.status === "open" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateMaintenance(m.id, "in_progress")}>
                              Start
                            </Button>
                          )}
                          {m.status === "in_progress" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateMaintenance(m.id, "resolved")}>
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagement;
