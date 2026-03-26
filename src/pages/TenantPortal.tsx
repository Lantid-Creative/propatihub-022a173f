import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail, CheckCircle, XCircle, Shield, Home, Banknote, Calendar, ArrowRight, Loader2, ClipboardList, Scale, Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TenantRecordForm from "@/components/TenantRecordForm";
import ReactMarkdown from "react-markdown";

const TenantPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [viewingContract, setViewingContract] = useState<any | null>(null);

  // Maintenance form
  const [maintOpen, setMaintOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({ tenancy_id: "", title: "", description: "", priority: "medium" });

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);

    // Fetch pending invitations for this email
    const { data: invs } = await supabase
      .from("tenant_invitations")
      .select("*")
      .eq("tenant_email", user!.email!)
      .order("created_at", { ascending: false });

    if (invs) {
      // Enrich with property info
      const propIds = [...new Set(invs.map(i => i.property_id))];
      const { data: props } = await supabase.from("properties").select("id, title, city, state, images").in("id", propIds);
      const propMap = new Map(props?.map(p => [p.id, p]) || []);
      // Enrich with inviter info
      const inviterIds = [...new Set(invs.map(i => i.invited_by))];
      const { data: inviters } = await supabase.from("profiles").select("user_id, full_name").in("user_id", inviterIds);
      const inviterMap = new Map(inviters?.map(i => [i.user_id, i]) || []);

      setInvitations(invs.map(i => ({
        ...i,
        property: propMap.get(i.property_id),
        inviter: inviterMap.get(i.invited_by),
      })));
    }

    // Fetch tenancies
    const { data: tens } = await supabase
      .from("tenancies")
      .select("*")
      .eq("tenant_id", user!.id)
      .order("created_at", { ascending: false });

    if (tens) {
      const propIds = [...new Set(tens.map(t => t.property_id))];
      const { data: props } = await supabase.from("properties").select("id, title, city, state, images").in("id", propIds.length > 0 ? propIds : ["none"]);
      const propMap = new Map(props?.map(p => [p.id, p]) || []);
      setTenancies(tens.map(t => ({ ...t, property: propMap.get(t.property_id) })));
    }

    // Fetch escrows
    const { data: escs } = await supabase
      .from("caution_fee_escrow")
      .select("*")
      .eq("tenant_id", user!.id)
      .order("created_at", { ascending: false });
    setEscrows(escs || []);

    // Fetch maintenance
    const tenancyIds = (tens || []).map(t => t.id);
    if (tenancyIds.length > 0) {
      const { data: maint } = await supabase
        .from("maintenance_requests")
        .select("*")
        .in("tenancy_id", tenancyIds)
        .order("created_at", { ascending: false });
      setMaintenance(maint || []);
    }

    // Fetch contracts
    const { data: cons } = await supabase
      .from("legal_contracts")
      .select("*")
      .eq("tenant_id", user!.id)
      .order("created_at", { ascending: false });
    setContracts(cons || []);

    setLoading(false);
  };

  const handleAcceptInvitation = async (invitation: any) => {
    setAccepting(invitation.id);

    // Create tenancy
    const { data: tenancy, error: tenError } = await supabase.from("tenancies").insert({
      property_id: invitation.property_id,
      tenant_id: user!.id,
      landlord_id: invitation.invited_by,
      invitation_id: invitation.id,
      monthly_rent: invitation.monthly_rent,
      lease_start: invitation.lease_start,
      lease_end: invitation.lease_end,
    } as any).select("id").single();

    if (tenError) {
      toast({ title: "Error", description: tenError.message, variant: "destructive" });
      setAccepting(null);
      return;
    }

    // Update invitation status
    await supabase.from("tenant_invitations").update({
      status: "accepted",
      accepted_by: user!.id,
    } as any).eq("id", invitation.id);

    // Create escrow record
    await supabase.from("caution_fee_escrow").insert({
      tenancy_id: tenancy.id,
      property_id: invitation.property_id,
      tenant_id: user!.id,
      landlord_id: invitation.invited_by,
      amount: invitation.caution_fee,
    } as any);

    toast({ title: "Invitation accepted!", description: "You can now pay the caution fee." });
    setAccepting(null);
    fetchAll();
  };

  const handlePayCautionFee = async (escrow: any) => {
    setPaying(escrow.id);

    try {
      const { data, error } = await supabase.functions.invoke("paystack-payment/initialize", {
        body: {
          email: user!.email,
          amount: escrow.amount,
          tenancy_id: escrow.tenancy_id,
          property_id: escrow.property_id,
          tenant_id: user!.id,
          landlord_id: escrow.landlord_id,
          payment_type: "caution_fee",
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Store reference for verification later
        localStorage.setItem("paystack_ref", data.reference);
        localStorage.setItem("paystack_escrow_id", escrow.id);
        window.open(data.authorization_url, "_blank");
        toast({ title: "Payment initiated", description: "Complete the payment in the new tab. Then click 'Verify Payment' below." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to initialize payment", variant: "destructive" });
    }
    setPaying(null);
  };

  const handleVerifyPayment = async (escrowId: string) => {
    const reference = localStorage.getItem("paystack_ref");
    if (!reference) {
      toast({ title: "No payment reference found", variant: "destructive" });
      return;
    }

    setPaying(escrowId);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-payment/verify", {
        body: { reference },
      });

      if (error) throw error;
      if (data?.success) {
        toast({ title: "Payment verified!", description: "Caution fee is now held in escrow." });
        localStorage.removeItem("paystack_ref");
        localStorage.removeItem("paystack_escrow_id");
        fetchAll();
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
    setPaying(null);
  };

  const handleSubmitMaintenance = async () => {
    if (!maintForm.tenancy_id || !maintForm.title) {
      toast({ title: "Fill in required fields", variant: "destructive" });
      return;
    }

    const tenancy = tenancies.find(t => t.id === maintForm.tenancy_id);
    const { error } = await supabase.from("maintenance_requests").insert({
      tenancy_id: maintForm.tenancy_id,
      property_id: tenancy?.property_id,
      tenant_id: user!.id,
      title: maintForm.title,
      description: maintForm.description || null,
      priority: maintForm.priority,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request submitted" });
      setMaintOpen(false);
      setMaintForm({ tenancy_id: "", title: "", description: "", priority: "medium" });
      fetchAll();
    }
  };

  const formatPrice = (p: number) => `₦${p.toLocaleString()}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const pendingInvitations = invitations.filter(i => i.status === "pending");
  const pendingEscrows = escrows.filter(e => e.payment_status === "pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Tenancy</h1>
          <p className="text-sm font-body text-muted-foreground">Manage your rentals, caution fees, and maintenance requests</p>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent" /> Pending Invitations
            </h2>
            {pendingInvitations.map((inv) => (
              <Card key={inv.id} className="border-accent/30 bg-accent/5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {inv.property?.images?.[0] ? (
                        <img src={inv.property.images[0]} className="w-16 h-16 rounded-lg object-cover shrink-0" alt="" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Home className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-body font-semibold text-foreground">{inv.property?.title || "Property"}</p>
                        <p className="text-xs text-muted-foreground font-body">{inv.property?.city}, {inv.property?.state}</p>
                        <p className="text-xs text-muted-foreground font-body mt-1">
                          From: {inv.inviter?.full_name || "Landlord"}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs font-body text-foreground">
                          <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> {formatPrice(inv.monthly_rent)}/mo</span>
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {formatPrice(inv.caution_fee)} caution</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {inv.lease_start}</span>
                        </div>
                        {inv.message && <p className="text-xs text-muted-foreground font-body mt-2 italic">"{inv.message}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvitation(inv)}
                        disabled={accepting === inv.id}
                      >
                        {accepting === inv.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Caution Fee Payments */}
        {pendingEscrows.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Pay Caution Fee
            </h2>
            {pendingEscrows.map((esc) => (
              <Card key={esc.id} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xl font-bold text-foreground">{formatPrice(esc.amount)}</p>
                      <p className="text-xs text-muted-foreground font-body">Caution fee — held securely until end of tenancy</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handlePayCautionFee(esc)} disabled={paying === esc.id}>
                        {paying === esc.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Banknote className="w-3 h-3 mr-1" />}
                        Pay with Paystack
                      </Button>
                      {localStorage.getItem("paystack_escrow_id") === esc.id && (
                        <Button variant="outline" onClick={() => handleVerifyPayment(esc.id)} disabled={paying === esc.id}>
                          Verify Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Tenancies */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-foreground text-lg">My Rentals</h2>
          {tenancies.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No active tenancies. Check your email for invitations.</p>
            </CardContent></Card>
          ) : (
            tenancies.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {t.property?.images?.[0] ? (
                        <img src={t.property.images[0]} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Home className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-body font-semibold text-foreground text-sm">{t.property?.title}</p>
                        <p className="text-xs text-muted-foreground font-body">{formatPrice(t.monthly_rent)}/mo · {t.lease_start} → {t.lease_end || "Ongoing"}</p>
                      </div>
                    </div>
                    <Badge className={t.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>{t.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Digital Records */}
        {tenancies.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> My Digital Records
            </h2>
            <p className="text-sm text-muted-foreground font-body">Fill in your details digitally — no paperwork needed.</p>
            {tenancies.map((t: any) => (
              <Card key={`record-${t.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-body flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent" />
                    {t.property?.title || "Property"}
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

        {/* Escrow Status */}
        {escrows.filter(e => e.payment_status === "paid").length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" /> Caution Fee Escrow
            </h2>
            {escrows.filter(e => e.payment_status === "paid").map((esc) => (
              <Card key={esc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{formatPrice(esc.amount)}</p>
                      <p className="text-xs text-muted-foreground font-body capitalize">
                        Status: {esc.escrow_status.replace("_", " ")}
                      </p>
                    </div>
                    <Badge className={
                      esc.escrow_status === "held" ? "bg-blue-100 text-blue-700" :
                      esc.escrow_status === "released" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    }>
                      {esc.escrow_status === "held" ? "Secured" :
                       esc.escrow_status === "released" ? "Released" : "Pending Release"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Maintenance Requests */}
        {tenancies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-foreground text-lg">Maintenance Requests</h2>
              <Button size="sm" variant="outline" onClick={() => setMaintOpen(!maintOpen)}>
                Report Issue
              </Button>
            </div>

            {maintOpen && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <select
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                    value={maintForm.tenancy_id}
                    onChange={(e) => setMaintForm({ ...maintForm, tenancy_id: e.target.value })}
                  >
                    <option value="">Select property</option>
                    {tenancies.map(t => (
                      <option key={t.id} value={t.id}>{t.property?.title}</option>
                    ))}
                  </select>
                  <input
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                    placeholder="Issue title *"
                    value={maintForm.title}
                    onChange={(e) => setMaintForm({ ...maintForm, title: e.target.value })}
                  />
                  <textarea
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                    placeholder="Describe the issue..."
                    rows={3}
                    value={maintForm.description}
                    onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  />
                  <select
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm font-body bg-background text-foreground"
                    value={maintForm.priority}
                    onChange={(e) => setMaintForm({ ...maintForm, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <Button onClick={handleSubmitMaintenance} className="w-full">Submit Request</Button>
                </CardContent>
              </Card>
            )}

            {maintenance.length === 0 ? (
              <Card><CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground font-body">No maintenance requests.</p>
              </CardContent></Card>
            ) : (
              maintenance.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-body font-semibold text-foreground text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground font-body">{m.description?.slice(0, 80)}</p>
                      </div>
                      <Badge className={
                        m.status === "open" ? "bg-red-100 text-red-700" :
                        m.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }>{m.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* My Contracts */}
        <div className="mt-10">
          <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent" /> My Legal Contracts
          </h2>

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

          {contracts.length === 0 ? (
            <Card><CardContent className="py-8 text-center">
              <Scale className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">No contracts yet. Your landlord can generate contracts for your tenancy.</p>
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
                          {c.contract_type.replace("_", " ")} · {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewingContract(c)}>
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantPortal;
