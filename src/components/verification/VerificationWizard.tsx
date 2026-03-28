import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVerification } from "@/hooks/useVerification";
import { VERIFICATION_STEPS, type VerificationType } from "@/types/verification";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShieldCheck, ChevronRight, ChevronLeft, Upload, 
  CheckCircle, AlertCircle, Loader2, User, 
  ScanFace, FileText, Building2, Camera, X 
} from "lucide-react";
import SelfieCamera from "./SelfieCamera";

interface VerificationWizardProps {
  defaultType?: VerificationType;
  onComplete?: () => void;
}

const VerificationWizard = ({ defaultType, onComplete }: VerificationWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedType, setSelectedType] = useState<VerificationType | null>(defaultType || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const verType = selectedType || "customer";
  const {
    verification,
    loading,
    createVerification,
    saveStep,
    submitVerification,
    restartVerification,
    uploadDocument,
    uploadSelfie,
    refetch,
  } = useVerification(verType);

  const steps = useMemo(() => (selectedType ? VERIFICATION_STEPS[selectedType] : []), [selectedType]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already approved
  if (verification?.status === "approved") {
    return (
      <Card className="max-w-lg mx-auto border-green-500/20 bg-green-500/5">
        <CardContent className="py-10 text-center space-y-4">
          <ShieldCheck className="w-16 h-16 text-green-600 mx-auto" />
          <h2 className="text-2xl font-semibold text-green-700 dark:text-green-400">Identity Verified</h2>
          <p className="text-muted-foreground font-body">Your identity has been successfully verified. You have full access to all platform features.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">Go to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  // If rejected or needs resubmission
  if (verification?.status === "rejected" || verification?.status === "needs_resubmission") {
    return (
      <Card className="max-w-lg mx-auto border-destructive/20">
        <CardContent className="py-10 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-semibold">
            {verification.status === "rejected" ? "Verification Rejected" : "Resubmission Required"}
          </h2>
          <p className="text-muted-foreground font-body">
            {verification.rejection_reason || verification.resubmission_notes || "Please review and resubmit your verification."}
          </p>
          <Button
            onClick={async () => {
              if (!verification) return;
              try {
                setSubmitting(true);
                await restartVerification(verification.id);
                setSelectedType(verification.verification_type);
                setCurrentStep(0);
                toast({ title: "Restarting Application", description: "You can now update your details and resubmit." });
              } catch (e: unknown) {
                toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to restart", variant: "destructive" });
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Resubmit Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If pending review
  if (verification?.status === "pending_review" || verification?.status === "under_manual_review") {
    return (
      <Card className="max-w-lg mx-auto border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-10 text-center space-y-4">
          <Loader2 className="w-16 h-16 text-amber-600 mx-auto animate-spin" />
          <h2 className="text-2xl font-semibold text-amber-700 dark:text-amber-400">Under Review</h2>
          <p className="text-muted-foreground font-body">Your verification submission is being reviewed by our team. This typically takes up to 24 hours.</p>
        </CardContent>
      </Card>
    );
  }

  // Type selection
  if (!selectedType) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight font-display">Identity Verification</h1>
          <p className="text-muted-foreground max-w-md mx-auto font-body">
            Select your verification type to get started. This ensures a secure and trusted experience for everyone.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { type: "customer" as const, title: "Buyer / Bidder", desc: "Quick verification to start bidding", icon: User },
            { type: "owner" as const, title: "Property Owner", desc: "Verify to list and sell properties", icon: Building2 },
            { type: "agent" as const, title: "Real Estate Agent", desc: "Professional agent verification", icon: User },
            { type: "agency" as const, title: "Agency (KYB)", desc: "Business entity verification", icon: Building2 },
          ]).map(({ type, title, desc, icon: Icon }) => (
            <Card
              key={type}
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md group"
              onClick={() => setSelectedType(type)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold font-display">{title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto self-center shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Wizard steps
  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (!currentStepConfig) return;
    setSubmitting(true);

    try {
      let currentVerification = verification;

      if (currentStepConfig.id === "identity" || currentStepConfig.id === "business" || currentStepConfig.id === "director") {
        if (!currentVerification) {
          currentVerification = await createVerification(formData);
        } else {
          currentVerification = await saveStep(currentVerification.id, currentStepConfig.id, formData);
        }
      }

      if (currentStepConfig.id === "documents") {
        const vid = currentVerification?.id;
        if (!vid) throw new Error("Verification not found");
        const entries = Object.entries(uploadedFiles);
        for (let i = 0; i < entries.length; i++) {
          const [docType, file] = entries[i];
          await uploadDocument(vid, docType, file);
        }
      }

      if (isLastStep) {
        if (!currentVerification) throw new Error("Verification not found");
        const result = await submitVerification(currentVerification.id);
        
        // Immediately refetch so the "Under Review" card shows right away
        await refetch();
        
        toast({
          title: result.autoApproved ? "✅ Verified!" : "Submitted for Review",
          description: result.autoApproved
            ? "Your identity is verified. You can now access all features."
            : "Our team will review your submission within 24 hours.",
        });
        onComplete?.();
        return;
      }

      setCurrentStep((s) => s + 1);
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfieCapture = async (blob: Blob) => {
    setSubmitting(true);

    try {
      // Ensure we have a verification record before uploading
      let vid = verification?.id;
      if (!vid) {
        const created = await createVerification(formData);
        vid = created?.id;
      }
      if (!vid) throw new Error("Could not create verification record");

      toast({
        title: "Securing Identity Scan",
        description: "Processing your biometric capture...",
      });

      await uploadSelfie(vid, blob);
      
      toast({ 
        title: "✅ Identity Secured", 
        description: "Your photo has been successfully verified." 
      });
      
      setIsCapturing(false);
      setCurrentStep((s) => s + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed";
      toast({
        title: "Secure Verification Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (!currentStepConfig) return null;
    const stepId = currentStepConfig.id;

    // Identity step
    if (stepId === "identity") {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Legal Name</Label>
              <Input placeholder="As it appears on your ID" value={formData.full_legal_name || ""} onChange={(e) => updateField("full_legal_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.date_of_birth || ""} onChange={(e) => updateField("date_of_birth", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="+234 xxx xxxx xxx" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={formData.country || "Nigeria"} onChange={(e) => updateField("country", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ID Type</Label>
              <Select value={formData.id_type || ""} onValueChange={(v) => updateField("id_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIN">National ID (NIN)</SelectItem>
                  <SelectItem value="Passport">International Passport</SelectItem>
                  <SelectItem value="Drivers License">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input placeholder="Enter your ID number" value={formData.id_number || ""} onChange={(e) => updateField("id_number", e.target.value.replace(/\s/g, ""))} />
            </div>
          </div>
          {(selectedType === "owner" || selectedType === "agent") && (
            <div className="space-y-2">
              <Label>Residential Address</Label>
              <Textarea placeholder="Full residential address" value={formData.residential_address || ""} onChange={(e) => updateField("residential_address", e.target.value)} />
            </div>
          )}
          {selectedType === "agent" && (
            <div className="space-y-2">
              <Label>Agent License Number</Label>
              <Input placeholder="Your real estate license number" value={formData.agent_license_number || ""} onChange={(e) => updateField("agent_license_number", e.target.value)} />
            </div>
          )}
          {selectedType === "owner" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>BVN (optional)</Label>
                <Input placeholder="Bank Verification Number" value={formData.bvn || ""} onChange={(e) => updateField("bvn", e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} />
              </div>
              <div className="space-y-2">
                <Label>NIN (optional)</Label>
                <Input placeholder="National Identification Number" value={formData.nin || ""} onChange={(e) => updateField("nin", e.target.value.replace(/\D/g, "").slice(0, 11))} maxLength={11} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Business step
    if (stepId === "business") {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{selectedType === "agency" ? "Registered Business Name" : "Company Name"}</Label>
              <Input value={formData.business_name || formData.company_name || ""} onChange={(e) => updateField(selectedType === "agency" ? "business_name" : "company_name", e.target.value)} />
            </div>
            {selectedType === "agency" && (
              <div className="space-y-2">
                <Label>CAC Registration Number</Label>
                <Input placeholder="RC-XXXXXXX" value={formData.cac_registration_number || ""} onChange={(e) => updateField("cac_registration_number", e.target.value)} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Business Address</Label>
            <Textarea placeholder="Full business address" value={formData.business_address || ""} onChange={(e) => updateField("business_address", e.target.value)} />
          </div>
          {selectedType === "api_partner" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Input placeholder="e.g. PropTech, Agency, Developer" value={formData.business_type || ""} onChange={(e) => updateField("business_type", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={formData.contact_person || ""} onChange={(e) => updateField("contact_person", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Technical Use Case</Label>
                <Textarea placeholder="Describe how you intend to use the PropatiHub API..." value={formData.technical_use_case || ""} onChange={(e) => updateField("technical_use_case", e.target.value)} rows={4} />
              </div>
            </>
          )}
        </div>
      );
    }

    // Director step
    if (stepId === "director") {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Director / Principal Officer Full Name</Label>
              <Input value={formData.director_full_name || ""} onChange={(e) => updateField("director_full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Director Phone Number</Label>
              <Input placeholder="+234 xxx xxxx xxx" value={formData.director_phone || ""} onChange={(e) => updateField("director_phone", e.target.value)} />
            </div>
          </div>
        </div>
      );
    }

    // Liveness step (Fallback to Selfie)
    if (stepId === "liveness") {
      if (isCapturing) {
        return (
          <div className="-mx-6 -mt-4">
            <SelfieCamera onCapture={handleSelfieCapture} onCancel={() => setIsCapturing(false)} />
          </div>
        );
      }

      return (
        <div className="space-y-6 text-center py-4">
          <div className="w-48 h-48 mx-auto rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
            {verification?.biometric_verified ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <ScanFace className="w-16 h-16 text-primary/60" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display">Identity Verification</h3>
            <p className="text-sm text-muted-foreground font-body max-w-sm mx-auto">
              We need a high-resolution selfie to verify your identity. This matches your face against your documents.
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Requirements</p>
            <ul className="text-sm space-y-2 text-muted-foreground font-body">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Good lighting is essential</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Remove glasses or hats</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Align face within the oval</li>
            </ul>
          </div>
          
          {!verification?.biometric_verified && (
            <Button
              onClick={() => setIsCapturing(true)}
              size="lg"
              className="gap-2 h-12 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              <Camera className="w-5 h-5" /> Start Identity Scan
            </Button>
          )}

          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Encrypted and stored securely
          </p>
        </div>
      );
    }

    // Documents step
    if (stepId === "documents") {
      const docTypes = getRequiredDocs(selectedType);
      return (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground font-body bg-muted/30 p-3 rounded-lg border border-dashed">
            Upload clear, legible copies of the required documents. Accepted formats: JPG, PNG, PDF (max 10MB each).
          </p>
          {docTypes.map(({ type, label, required }) => (
            <div key={type} className="space-y-2">
              <Label className="flex items-center gap-2 font-display text-sm font-semibold">
                {label}
                {required && <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-4 px-1">Required</Badge>}
              </Label>
              {uploadedFiles[type] ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-primary/5 border-primary/20 ring-1 ring-primary/10">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1 font-body text-foreground/80">{uploadedFiles[type].name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground" onClick={() => setUploadedFiles((prev) => { const n = { ...prev }; delete n[type]; return n; })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/[0.02] border-muted-foreground/20">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-semibold font-display">Click to upload</p>
                    <p className="text-xs text-muted-foreground font-body">or drag and drop file</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast({ title: "File too large", description: "Max file size is 10MB", variant: "destructive" });
                          return;
                        }
                        setUploadedFiles((prev) => ({ ...prev, [type]: file }));
                      }
                    }}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Review step
    if (stepId === "review") {
      return (
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-2xl p-6 border border-muted space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground font-display">Application Summary</h3>
            <div className="grid gap-4 sm:grid-cols-2 text-sm font-body">
              {formData.full_legal_name && <ReviewItem label="Full Name" value={formData.full_legal_name} />}
              {formData.date_of_birth && <ReviewItem label="Birth Date" value={formData.date_of_birth} />}
              {formData.phone && <ReviewItem label="Phone" value={formData.phone} />}
              {formData.id_type && <ReviewItem label="ID Type" value={formData.id_type} />}
              {formData.id_number && <ReviewItem label="ID Masked" value={`****${formData.id_number.slice(-4)}`} />}
              {formData.business_name && <ReviewItem label="Business" value={formData.business_name} />}
              {formData.cac_registration_number && <ReviewItem label="CAC Number" value={formData.cac_registration_number} />}
              {formData.agent_license_number && <ReviewItem label="Agent License" value={formData.agent_license_number} />}
            </div>
            {Object.keys(uploadedFiles).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-muted/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enclosed Documents</p>
                <div className="grid gap-2">
                  {Object.entries(uploadedFiles).map(([type, file]) => (
                    <div key={type} className="flex items-center gap-2 text-xs text-foreground/80 bg-white/50 p-2 rounded-lg border border-muted/30">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span className="capitalize">{type.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground flex-1 truncate">— {file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-primary/[0.02] border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
               <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            </div>
            <div className="text-sm space-y-1 font-body">
              <p className="font-bold font-display">Secure Submission</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                By submitting, you consent to PropatiHub securely processing your identity documents and biometric data for verification. 
                Your data is stored with bank-grade encryption and handled in strict accordance with our privacy policy.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress bar */}
      <div className="flex items-center gap-1 px-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-black transition-all duration-300 ${
              i < currentStep ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : i === currentStep ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              : "bg-muted text-muted-foreground"
            }`}>
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-500 overflow-hidden bg-muted`}>
                <div className={`h-full bg-primary transition-all duration-700 ${i < currentStep ? "w-full" : "w-0"}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step header */}
      <Card className="border-muted/50 shadow-xl shadow-black/[0.02] overflow-hidden rounded-3xl">
        {!isCapturing && (
          <CardHeader className="pb-6 pt-8 px-8 border-b border-muted/30 bg-muted/5">
            <div className="flex items-center justify-between mb-1">
              <CardTitle className="text-2xl font-bold font-display">{currentStepConfig?.title}</CardTitle>
              <Badge variant="outline" className="font-display font-medium border-muted text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <CardDescription className="font-body text-base">{currentStepConfig?.description}</CardDescription>
          </CardHeader>
        )}
        <CardContent className={`${isCapturing ? "p-0" : "pt-8 pb-8 px-8"}`}>
          {renderStepContent()}

          {/* Navigation */}
          {!isCapturing && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-muted/30">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentStep === 0) setSelectedType(null);
                  else setCurrentStep((s) => s - 1);
                }}
                className="gap-2 text-muted-foreground hover:text-foreground font-body h-12 px-6 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentStep === 0 ? "Back to Roles" : "Previous Step"}
              </Button>
              {currentStepConfig?.id !== "liveness" && (
                <Button 
                  onClick={handleNext} 
                  disabled={submitting} 
                  className="gap-2 h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-display font-bold transition-all hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : isLastStep ? (
                    <><CheckCircle className="w-4 h-4" /> Submit Application</>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/40 p-3 rounded-xl border border-muted/20">
      <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className="font-semibold text-foreground/90">{value}</p>
    </div>
  );
}

function getRequiredDocs(type: VerificationType) {
  switch (type) {
    case "customer":
      return [];
    case "owner":
      return [
        { type: "id_front", label: "National ID (Front Surface)", required: true },
        { type: "id_back", label: "National ID (Back Surface)", required: true },
        { type: "proof_of_address", label: "Utility Bill / Address Proof", required: true },
        { type: "ownership_document", label: "Land Title / Certificate of Occupancy", required: true },
      ];
    case "agent":
      return [
        { type: "id_front", label: "National ID (Front)", required: true },
        { type: "id_back", label: "National ID (Back)", required: true },
        { type: "agent_license", label: "Professional License Certificate", required: true },
        { type: "proof_of_address", label: "Residential Proof of Address", required: true },
      ];
    case "agency":
      return [
        { type: "cac_certificate", label: "CAC Incorporation Certificate", required: true },
        { type: "director_id", label: "Managing Director ID", required: true },
        { type: "business_proof_of_address", label: "Office Address Proof", required: true },
        { type: "tin_document", label: "TIN Tax Certificate", required: false },
      ];
    case "api_partner":
      return [
        { type: "business_registration", label: "Corporate License / Registration", required: true },
        { type: "officer_id", label: "Compliance Officer ID", required: true },
      ];
    default:
      return [];
  }
}

export default VerificationWizard;

