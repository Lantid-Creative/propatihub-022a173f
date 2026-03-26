import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  User, Briefcase, Users, ShieldAlert, Home, Phone, FileText,
  Save, CheckCircle, Loader2, Camera, Upload
} from "lucide-react";

interface TenantRecordFormProps {
  tenancyId: string;
  tenantId: string;
  landlordId: string;
  readOnly?: boolean;
  onSaved?: () => void;
}

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
];

const ID_TYPES = ["NIN", "International Passport", "Driver's License", "Voter's Card"];
const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

const TenantRecordForm = ({ tenancyId, tenantId, landlordId, readOnly = false, onSaved }: TenantRecordFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", date_of_birth: "", gender: "",
    marital_status: "", nationality: "Nigerian", state_of_origin: "",
    id_type: "", id_number: "", id_expiry_date: "", id_document_url: "",
    occupation: "", employer_name: "", employer_address: "", employer_phone: "",
    monthly_income: "",
    nok_full_name: "", nok_relationship: "", nok_phone: "", nok_email: "", nok_address: "",
    guarantor_full_name: "", guarantor_phone: "", guarantor_email: "",
    guarantor_address: "", guarantor_occupation: "", guarantor_id_url: "",
    previous_address: "", previous_landlord_name: "", previous_landlord_phone: "",
    reason_for_leaving: "",
    emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relationship: "",
    passport_photo_url: "", notes: "", status: "draft",
  });

  useEffect(() => {
    fetchRecord();
  }, [tenancyId]);

  const fetchRecord = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tenant_records" as any)
      .select("*")
      .eq("tenancy_id", tenancyId)
      .maybeSingle();

    if (data) {
      const d = data as any;
      setRecordId(d.id);
      setForm({
        full_name: d.full_name || "", email: d.email || "", phone: d.phone || "",
        date_of_birth: d.date_of_birth || "", gender: d.gender || "",
        marital_status: d.marital_status || "", nationality: d.nationality || "Nigerian",
        state_of_origin: d.state_of_origin || "",
        id_type: d.id_type || "", id_number: d.id_number || "",
        id_expiry_date: d.id_expiry_date || "", id_document_url: d.id_document_url || "",
        occupation: d.occupation || "", employer_name: d.employer_name || "",
        employer_address: d.employer_address || "", employer_phone: d.employer_phone || "",
        monthly_income: d.monthly_income?.toString() || "",
        nok_full_name: d.nok_full_name || "", nok_relationship: d.nok_relationship || "",
        nok_phone: d.nok_phone || "", nok_email: d.nok_email || "",
        nok_address: d.nok_address || "",
        guarantor_full_name: d.guarantor_full_name || "", guarantor_phone: d.guarantor_phone || "",
        guarantor_email: d.guarantor_email || "", guarantor_address: d.guarantor_address || "",
        guarantor_occupation: d.guarantor_occupation || "", guarantor_id_url: d.guarantor_id_url || "",
        previous_address: d.previous_address || "", previous_landlord_name: d.previous_landlord_name || "",
        previous_landlord_phone: d.previous_landlord_phone || "",
        reason_for_leaving: d.reason_for_leaving || "",
        emergency_contact_name: d.emergency_contact_name || "",
        emergency_contact_phone: d.emergency_contact_phone || "",
        emergency_contact_relationship: d.emergency_contact_relationship || "",
        passport_photo_url: d.passport_photo_url || "", notes: d.notes || "",
        status: d.status || "draft",
      });
    }
    setLoading(false);
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${tenancyId}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("tenant-documents").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("tenant-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, field);
      setForm(prev => ({ ...prev, [field]: url }));
      toast({ title: "File uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleSave = async (submitStatus?: string) => {
    if (!form.full_name.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload: any = {
      tenancy_id: tenancyId,
      tenant_id: tenantId,
      landlord_id: landlordId,
      ...form,
      monthly_income: form.monthly_income ? parseInt(form.monthly_income) : null,
      status: submitStatus || form.status,
    };

    let error;
    if (recordId) {
      ({ error } = await supabase.from("tenant_records" as any).update(payload).eq("id", recordId));
    } else {
      ({ error } = await supabase.from("tenant_records" as any).insert(payload));
    }

    if (error) {
      toast({ title: "Failed to save record", description: error.message, variant: "destructive" });
    } else {
      toast({ title: submitStatus === "submitted" ? "Record submitted!" : "Record saved as draft" });
      fetchRecord();
      onSaved?.();
    }
    setSaving(false);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setSelect = (field: string) => (val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const statusBadge = form.status === "verified"
    ? <Badge className="bg-green-600">Verified</Badge>
    : form.status === "submitted"
    ? <Badge className="bg-accent text-accent-foreground">Submitted</Badge>
    : <Badge variant="secondary">Draft</Badge>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Tenant Documentation</h3>
        </div>
        {statusBadge}
      </div>

      <Accordion type="multiple" defaultValue={["personal"]} className="space-y-2">
        {/* Personal Information */}
        <AccordionItem value="personal" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <User className="w-4 h-4 text-primary" /> Personal Information
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={set("full_name")} disabled={readOnly} placeholder="Full legal name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={set("email")} disabled={readOnly} type="email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={set("phone")} disabled={readOnly} placeholder="+234..." />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input value={form.date_of_birth} onChange={set("date_of_birth")} disabled={readOnly} type="date" />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={setSelect("gender")} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select value={form.marital_status} onValueChange={setSelect("marital_status")} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{MARITAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nationality</Label>
                <Input value={form.nationality} onChange={set("nationality")} disabled={readOnly} />
              </div>
              <div>
                <Label>State of Origin</Label>
                <Select value={form.state_of_origin} onValueChange={setSelect("state_of_origin")} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Passport Photo</Label>
                {form.passport_photo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.passport_photo_url} alt="Passport" className="w-16 h-16 rounded-lg object-cover border" />
                    {!readOnly && <label className="text-sm text-primary cursor-pointer hover:underline">
                      Change <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "passport_photo_url")} />
                    </label>}
                  </div>
                ) : !readOnly ? (
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload passport photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "passport_photo_url")} />
                  </label>
                ) : <p className="text-sm text-muted-foreground">No photo uploaded</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Identification */}
        <AccordionItem value="identification" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-primary" /> Identification
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label>ID Type</Label>
                <Select value={form.id_type} onValueChange={setSelect("id_type")} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                  <SelectContent>{ID_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>ID Number</Label>
                <Input value={form.id_number} onChange={set("id_number")} disabled={readOnly} />
              </div>
              <div>
                <Label>ID Expiry Date</Label>
                <Input value={form.id_expiry_date} onChange={set("id_expiry_date")} disabled={readOnly} type="date" />
              </div>
              <div>
                <Label>ID Document Scan</Label>
                {!readOnly ? (
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{form.id_document_url ? "Replace document" : "Upload ID scan"}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, "id_document_url")} />
                  </label>
                ) : form.id_document_url ? (
                  <a href={form.id_document_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View document</a>
                ) : <p className="text-sm text-muted-foreground">No document uploaded</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Employment */}
        <AccordionItem value="employment" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <Briefcase className="w-4 h-4 text-primary" /> Employment Details
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div><Label>Occupation</Label><Input value={form.occupation} onChange={set("occupation")} disabled={readOnly} /></div>
              <div><Label>Employer Name</Label><Input value={form.employer_name} onChange={set("employer_name")} disabled={readOnly} /></div>
              <div><Label>Employer Address</Label><Input value={form.employer_address} onChange={set("employer_address")} disabled={readOnly} /></div>
              <div><Label>Employer Phone</Label><Input value={form.employer_phone} onChange={set("employer_phone")} disabled={readOnly} /></div>
              <div><Label>Monthly Income (₦)</Label><Input value={form.monthly_income} onChange={set("monthly_income")} disabled={readOnly} type="number" /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Next of Kin */}
        <AccordionItem value="nok" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <Users className="w-4 h-4 text-primary" /> Next of Kin
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div><Label>Full Name</Label><Input value={form.nok_full_name} onChange={set("nok_full_name")} disabled={readOnly} /></div>
              <div><Label>Relationship</Label><Input value={form.nok_relationship} onChange={set("nok_relationship")} disabled={readOnly} placeholder="e.g. Brother, Mother" /></div>
              <div><Label>Phone</Label><Input value={form.nok_phone} onChange={set("nok_phone")} disabled={readOnly} /></div>
              <div><Label>Email</Label><Input value={form.nok_email} onChange={set("nok_email")} disabled={readOnly} type="email" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input value={form.nok_address} onChange={set("nok_address")} disabled={readOnly} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Guarantor */}
        <AccordionItem value="guarantor" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-primary" /> Guarantor
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div><Label>Full Name</Label><Input value={form.guarantor_full_name} onChange={set("guarantor_full_name")} disabled={readOnly} /></div>
              <div><Label>Phone</Label><Input value={form.guarantor_phone} onChange={set("guarantor_phone")} disabled={readOnly} /></div>
              <div><Label>Email</Label><Input value={form.guarantor_email} onChange={set("guarantor_email")} disabled={readOnly} type="email" /></div>
              <div><Label>Occupation</Label><Input value={form.guarantor_occupation} onChange={set("guarantor_occupation")} disabled={readOnly} /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Input value={form.guarantor_address} onChange={set("guarantor_address")} disabled={readOnly} /></div>
              <div>
                <Label>Guarantor ID Document</Label>
                {!readOnly ? (
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{form.guarantor_id_url ? "Replace" : "Upload ID"}</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, "guarantor_id_url")} />
                  </label>
                ) : form.guarantor_id_url ? (
                  <a href={form.guarantor_id_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View document</a>
                ) : <p className="text-sm text-muted-foreground">No document</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Previous Tenancy */}
        <AccordionItem value="previous" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <Home className="w-4 h-4 text-primary" /> Previous Tenancy
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2"><Label>Previous Address</Label><Input value={form.previous_address} onChange={set("previous_address")} disabled={readOnly} /></div>
              <div><Label>Previous Landlord Name</Label><Input value={form.previous_landlord_name} onChange={set("previous_landlord_name")} disabled={readOnly} /></div>
              <div><Label>Previous Landlord Phone</Label><Input value={form.previous_landlord_phone} onChange={set("previous_landlord_phone")} disabled={readOnly} /></div>
              <div className="sm:col-span-2"><Label>Reason for Leaving</Label><Textarea value={form.reason_for_leaving} onChange={set("reason_for_leaving")} disabled={readOnly} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Emergency Contact */}
        <AccordionItem value="emergency" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <Phone className="w-4 h-4 text-primary" /> Emergency Contact
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div><Label>Contact Name</Label><Input value={form.emergency_contact_name} onChange={set("emergency_contact_name")} disabled={readOnly} /></div>
              <div><Label>Phone</Label><Input value={form.emergency_contact_phone} onChange={set("emergency_contact_phone")} disabled={readOnly} /></div>
              <div><Label>Relationship</Label><Input value={form.emergency_contact_relationship} onChange={set("emergency_contact_relationship")} disabled={readOnly} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Notes */}
        <AccordionItem value="notes" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-2 font-semibold">
              <FileText className="w-4 h-4 text-primary" /> Additional Notes
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea value={form.notes} onChange={set("notes")} disabled={readOnly} placeholder="Any additional notes..." rows={4} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!readOnly && (
        <div className="flex gap-3 pt-2">
          <Button onClick={() => handleSave()} disabled={saving} variant="outline" className="flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave("submitted")} disabled={saving} className="flex-1 bg-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Submit Record
          </Button>
        </div>
      )}
    </div>
  );
};

export default TenantRecordForm;
