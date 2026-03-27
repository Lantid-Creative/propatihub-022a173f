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
  Home, ArrowUpRight, ArrowDownLeft, Eye, ClipboardList, Scale, Sparkles, Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import TenantRecordForm from "@/components/TenantRecordForm";
import DisputeManager from "@/components/DisputeManager";

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
  const [contracts, setContracts] = useState<any[]>([]);
  const [generatingContract, setGeneratingContract] = useState(false);
  const [contractForm, setContractForm] = useState({ tenancy_id: "", contract_type: "tenancy_agreement" });
  const [viewingContract, setViewingContract] = useState<any | null>(null);
  const [rejectingEscrowId, setRejectingEscrowId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [disbursing, setDisbursing] = useState<string | null>(null);

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

    // Fetch contracts
    const { data: cons } = await supabase
      .from("legal_contracts")
      .select("*")
      .eq("landlord_id", user!.id)
      .order("created_at", { ascending: false });
    setContracts(cons || []);

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
        release_requested_by: "landlord",
      } as any)
      .eq("id", escrowId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Release initiated", description: "The caution fee will be released to the tenant." });
      fetchAll();
    }
  };

  const handleApproveRelease = async (escrowId: string) => {
    setDisbursing(escrowId);
    try {
      const { data, error } = await supabase.functions.invoke("escrow-disburse", {
        body: { escrow_id: escrowId },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payout sent!",
          description: `₦${data.amount?.toLocaleString()} has been transferred to ${data.recipient}. Ref: ${data.transfer_reference}`,
        });
      } else if (data?.error) {
        toast({ title: "Disbursement failed", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to disburse funds", variant: "destructive" });
    }
    setDisbursing(null);
    fetchAll();
  };


  const handleRejectRelease = async (escrowId: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }

    // 1. Reject the escrow
    const { error } = await supabase
      .from("caution_fee_escrow")
      .update({
        escrow_status: "release_rejected",
        release_rejected_at: new Date().toISOString(),
        release_rejected_reason: rejectReason,
      } as any)
      .eq("id", escrowId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // 2. Find the escrow details for auto-dispute
    const escrow = escrows.find((e: any) => e.id === escrowId);
    if (escrow) {
      // Auto-create a dispute
      await supabase.from("disputes").insert({
        property_id: escrow.property_id,
        tenancy_id: escrow.tenancy_id,
        filed_by: escrow.tenant_id,
        filed_against: escrow.landlord_id,
        category: "caution_fee",
        subject: "Caution Fee Payout Rejected",
        description: `The landlord/property manager rejected the tenant's caution fee payout request.\n\nRejection reason: ${rejectReason}\n\nAmount: ₦${escrow.amount.toLocaleString()}\n\nThis dispute was automatically created by the system for resolution by our litigator experts.`,
        priority: "high",
        status: "escalated",
      } as any);
    }

    toast({ title: "Payout rejected", description: "A dispute has been automatically logged for our litigator team to resolve." });
    setRejectingEscrowId(null);
    setRejectReason("");
    fetchAll();
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

  const handleGenerateContract = async () => {
    if (!contractForm.tenancy_id) {
      toast({ title: "Select a tenancy", variant: "destructive" });
      return;
    }
    setGeneratingContract(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-contract", {
        body: { tenancy_id: contractForm.tenancy_id, contract_type: contractForm.contract_type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Contract generated!", description: "Your AI-drafted legal contract is ready." });
      setViewingContract(data.contract);
      fetchAll();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate contract", variant: "destructive" });
    }
    setGeneratingContract(false);
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
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="tenancies" className="text-xs">Tenancies</TabsTrigger>
            <TabsTrigger value="invitations" className="text-xs">Invitations</TabsTrigger>
            <TabsTrigger value="records" className="text-xs">Records</TabsTrigger>
            <TabsTrigger value="contracts" className="text-xs">Contracts</TabsTrigger>
            <TabsTrigger value="escrow" className="text-xs">Escrow</TabsTrigger>
            <TabsTrigger value="rent" className="text-xs">Rent</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs">Disputes</TabsTrigger>
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

          {/* Digital Records */}
          <TabsContent value="records">
            {tenancies.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">No tenancies yet. Invite a tenant to start capturing their records digitally.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-body">Select a tenancy to view or manage the tenant's digital record.</p>
                {tenancies.map((t) => (
                  <Card key={t.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-body flex items-center gap-2">
                        <Home className="w-4 h-4 text-accent" />
                        {t.property?.title || "Property"} — {t.tenant?.full_name || "Tenant"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TenantRecordForm
                        tenancyId={t.id}
                        tenantId={t.tenant_id}
                        landlordId={t.landlord_id}
                        readOnly={false}
                      />
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
                {escrows.map((esc) => {
                  const isTenantRequest = esc.escrow_status === "release_requested" && (esc as any).release_requested_by === "tenant";
                  const isRejected = esc.escrow_status === "release_rejected";
                  const isReleased = esc.escrow_status === "released";
                  const autoReleaseAt = (esc as any).auto_release_at;

                  return (
                    <Card key={esc.id} className={isTenantRequest ? "border-yellow-300 bg-yellow-50/30" : isRejected ? "border-red-200" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-body font-semibold text-foreground text-sm">
                              {formatPrice(esc.amount)} Caution Fee
                            </p>
                            <p className="text-xs text-muted-foreground font-body">
                              Payment: {statusBadge(esc.payment_status)} · Escrow: {statusBadge(esc.escrow_status.replace(/_/g, " "))}
                            </p>
                            {isTenantRequest && (
                              <div className="mt-2 p-2 rounded-lg bg-yellow-100/60 border border-yellow-200">
                                <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Tenant has requested payout
                                </p>
                                {autoReleaseAt && (
                                  <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Auto-releases by {new Date(autoReleaseAt).toLocaleDateString()} at {new Date(autoReleaseAt).toLocaleTimeString()} if not actioned
                                  </p>
                                )}
                              </div>
                            )}
                            {isRejected && (esc as any).release_rejected_reason && (
                              <p className="text-xs text-red-600 font-body mt-1">
                                Rejected: {(esc as any).release_rejected_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {esc.escrow_status === "held" && esc.payment_status === "paid" && (
                              <Button size="sm" variant="outline" onClick={() => handleReleaseEscrow(esc.id)}>
                                <ArrowUpRight className="w-3 h-3 mr-1" /> Initiate Release
                              </Button>
                            )}
                            {isTenantRequest && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveRelease(esc.id)} disabled={disbursing === esc.id}>
                                  {disbursing === esc.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                  {disbursing === esc.id ? "Disbursing..." : "Approve & Disburse"}
                                </Button>
                                {rejectingEscrowId === esc.id ? (
                                  <div className="space-y-2 w-56">
                                    <Textarea
                                      placeholder="Reason for rejection *"
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                      className="text-xs"
                                      rows={2}
                                    />
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleRejectRelease(esc.id)}>
                                        Confirm Reject
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => { setRejectingEscrowId(null); setRejectReason(""); }}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="destructive" onClick={() => setRejectingEscrowId(esc.id)}>
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                  </Button>
                                )}
                              </>
                            )}
                            {isReleased && (
                              <Badge className="bg-green-100 text-green-700">Released</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

          {/* Contracts */}
          <TabsContent value="contracts">
            <div className="space-y-4">
              {/* Generate contract form */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Generate AI Legal Contract
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-body font-medium text-foreground block mb-1.5">Tenancy *</label>
                      <Select value={contractForm.tenancy_id} onValueChange={(v) => setContractForm({ ...contractForm, tenancy_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select a tenancy" /></SelectTrigger>
                        <SelectContent>
                          {tenancies.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.tenant?.full_name || "Tenant"} — {t.property?.title || "Property"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-body font-medium text-foreground block mb-1.5">Contract Type</label>
                      <Select value={contractForm.contract_type} onValueChange={(v) => setContractForm({ ...contractForm, contract_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenancy_agreement">Tenancy Agreement</SelectItem>
                          <SelectItem value="lease_renewal">Lease Renewal</SelectItem>
                          <SelectItem value="property_management">Property Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleGenerateContract} disabled={generatingContract} className="w-full gap-2">
                        {generatingContract ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generatingContract ? "Generating..." : "Generate Contract"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* View contract dialog */}
              {viewingContract && (
                <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-display">{viewingContract.title}</DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm max-w-none font-body text-foreground">
                      <ReactMarkdown>{viewingContract.content}</ReactMarkdown>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Contracts list */}
              {contracts.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <Scale className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-sm text-muted-foreground">No contracts yet. Generate your first AI legal contract above.</p>
                </CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {contracts.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body font-semibold text-foreground text-sm">{c.title}</p>
                            <p className="text-xs text-muted-foreground font-body mt-1">
                              {c.contract_type.replace("_", " ")} · Created {new Date(c.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusBadge(c.status)}
                            <Button size="sm" variant="outline" onClick={() => setViewingContract(c)}>
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes">
            <DisputeManager tenancies={tenancies} role="landlord" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PropertyManagement;
