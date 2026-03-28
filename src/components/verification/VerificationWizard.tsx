import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVerification } from "@/hooks/useVerification";
import { VERIFICATION_STEPS, type VerificationType, type VerificationStatus } from "@/types/verification";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, ChevronRight, ChevronLeft, Upload, CheckCircle, AlertCircle, Loader2, User, ScanFace, FileText, Building2, Camera, X } from "lucide-react";

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
  const [livenessActive, setLivenessActive] = useState(false);
  const [livenessResult, setLivenessResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [livenessError, setLivenessError] = useState<string | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const verType = selectedType || "customer";
  const {
    verification,
    loading,
    createVerification,
    saveStep,
    createLivenessSession,
    verifyLivenessResult,
    submitVerification,
    uploadDocument,
    refetch,
  } = useVerification(verType);

  const steps = selectedType ? VERIFICATION_STEPS[selectedType] : [];

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Resume from existing verification
  const effectiveStep = verification && !selectedType ? 0 : currentStep;

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
          <p className="text-muted-foreground">Your identity has been successfully verified. You have full access to all platform features.</p>
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
          <p className="text-muted-foreground">
            {verification.rejection_reason || verification.resubmission_notes || "Please review and resubmit your verification."}
          </p>
          <Button onClick={() => { setSelectedType(verification.verification_type); setCurrentStep(0); }}>
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
          <p className="text-muted-foreground">Your verification submission is being reviewed by our team. This typically takes up to 24 hours.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
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
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
              onClick={() => setSelectedType(type)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
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
        for (const [docType, file] of Object.entries(uploadedFiles)) {
          await uploadDocument(vid, docType, file);
        }
      }

      if (isLastStep) {
        if (!currentVerification) throw new Error("Verification not found");
        const result = await submitVerification(currentVerification.id);
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

  const handleLiveness = async () => {
    if (!verification) return;
    setLivenessActive(true);
    setLivenessError(null);

    try {
      const session = await createLivenessSession(verification.id);

      toast({
        title: "Face Verification",
        description: "Position your face in the frame and follow the prompts.",
      });

      const result = await verifyLivenessResult(verification.id, session.sessionId);
      setLivenessResult(result);

      if (result.passed) {
        toast({ title: "✅ Face Verified", description: "Your liveness check passed successfully." });
        await refetch();
        setCurrentStep((s) => s + 1);
      } else {
        toast({
          title: "Verification Failed",
          description: `Attempts remaining: ${result.attemptsRemaining}. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Liveness verification failed";
      setLivenessError(message);
      toast({
        title: "Face verification unavailable",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLivenessActive(false);
    }
  };

  const renderStepContent = () => {
    if (!currentStepConfig) return null;
    const stepId = currentStepConfig.id;

    // Identity step (customer, owner, agent)
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

    // Business step (agency, api_partner)
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
                <Label>Technical Use Case / Integration Description</Label>
                <Textarea placeholder="Describe how you intend to use the PropatiHub API..." value={formData.technical_use_case || ""} onChange={(e) => updateField("technical_use_case", e.target.value)} rows={4} />
              </div>
            </>
          )}
          {selectedType === "agency" && (
            <div className="space-y-2">
              <Label>TIN Number (optional)</Label>
              <Input placeholder="Tax Identification Number" value={formData.tin_number || ""} onChange={(e) => updateField("tin_number", e.target.value)} />
            </div>
          )}
        </div>
      );
    }

    // Director step (agency)
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

    // Liveness step
    if (stepId === "liveness") {
      return (
        <div className="space-y-6 text-center">
          <div className="w-48 h-48 mx-auto rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
            {livenessActive ? (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            ) : livenessResult?.passed ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <ScanFace className="w-16 h-16 text-primary/60" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Guided Face Verification</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              We'll use your camera for a quick, secure liveness check. This confirms you're a real person — no selfie-with-ID needed.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 max-w-sm mx-auto text-left space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What to expect</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Center your face in the frame</li>
              <li>• Follow on-screen prompts</li>
              <li>• Hold still for capture</li>
              <li>• Good lighting helps accuracy</li>
            </ul>
          </div>
          {livenessError && (
            <div className="max-w-md mx-auto rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-left">
              <p className="text-sm font-medium text-foreground">Face verification is unavailable right now</p>
              <p className="mt-1 text-sm text-muted-foreground">{livenessError}</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your data is encrypted and processed securely</span>
          </div>
          {!livenessResult?.passed && (
            <Button
              onClick={handleLiveness}
              disabled={livenessActive}
              size="lg"
              className="gap-2"
            >
              {livenessActive ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><Camera className="w-4 h-4" /> Start Face Verification</>
              )}
            </Button>
          )}
        </div>
      );
    }

    // Documents step
    if (stepId === "documents") {
      const docTypes = getRequiredDocs(selectedType);
      return (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Upload clear, legible copies of the required documents. Accepted formats: JPG, PNG, PDF (max 10MB each).
          </p>
          {docTypes.map(({ type, label, required }) => (
            <div key={type} className="space-y-2">
              <Label className="flex items-center gap-2">
                {label}
                {required && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
              </Label>
              {uploadedFiles[type] ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{uploadedFiles[type].name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUploadedFiles((prev) => { const n = { ...prev }; delete n[type]; return n; })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload</span>
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
          <div className="bg-muted/30 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Summary</h3>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {formData.full_legal_name && <ReviewItem label="Full Name" value={formData.full_legal_name} />}
              {formData.date_of_birth && <ReviewItem label="Date of Birth" value={formData.date_of_birth} />}
              {formData.phone && <ReviewItem label="Phone" value={formData.phone} />}
              {formData.id_type && <ReviewItem label="ID Type" value={formData.id_type} />}
              {formData.id_number && <ReviewItem label="ID Number" value={`****${formData.id_number.slice(-4)}`} />}
              {formData.business_name && <ReviewItem label="Business Name" value={formData.business_name} />}
              {formData.cac_registration_number && <ReviewItem label="CAC Number" value={formData.cac_registration_number} />}
              {formData.agent_license_number && <ReviewItem label="License" value={formData.agent_license_number} />}
              {formData.director_full_name && <ReviewItem label="Director" value={formData.director_full_name} />}
            </div>
            {Object.keys(uploadedFiles).length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground uppercase">Documents</p>
                {Object.entries(uploadedFiles).map(([type, file]) => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">{type.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">— {file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Secure Submission</p>
              <p className="text-muted-foreground">
                By submitting, you consent to PropatiHub securely processing your identity documents for verification purposes.
                Your data is encrypted and handled in accordance with our privacy policy.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
              i < currentStep ? "bg-primary text-primary-foreground"
              : i === currentStep ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              : "bg-muted text-muted-foreground"
            }`}>
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 transition-colors ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{currentStepConfig?.title}</CardTitle>
          <CardDescription>{currentStepConfig?.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 0) setSelectedType(null);
                else setCurrentStep((s) => s - 1);
              }}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 0 ? "Back" : "Previous"}
            </Button>
            {currentStepConfig?.id !== "liveness" && (
              <Button onClick={handleNext} disabled={submitting} className="gap-1">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : isLastStep ? (
                  <><CheckCircle className="w-4 h-4" /> Submit Verification</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function getRequiredDocs(type: VerificationType) {
  switch (type) {
    case "customer":
      return [];
    case "owner":
      return [
        { type: "id_front", label: "National ID (Front)", required: true },
        { type: "id_back", label: "National ID (Back)", required: true },
        { type: "proof_of_address", label: "Proof of Address", required: true },
        { type: "ownership_document", label: "Land Title / Certificate of Occupancy", required: true },
      ];
    case "agent":
      return [
        { type: "id_front", label: "National ID (Front)", required: true },
        { type: "id_back", label: "National ID (Back)", required: true },
        { type: "agent_license", label: "Agent License Certificate", required: true },
        { type: "proof_of_address", label: "Proof of Address", required: true },
      ];
    case "agency":
      return [
        { type: "cac_certificate", label: "CAC Certificate", required: true },
        { type: "director_id", label: "Director ID", required: true },
        { type: "business_proof_of_address", label: "Business Address Proof", required: true },
        { type: "tin_document", label: "TIN Certificate", required: false },
      ];
    case "api_partner":
      return [
        { type: "business_registration", label: "Business Registration/License", required: true },
        { type: "officer_id", label: "Responsible Officer ID", required: true },
      ];
    default:
      return [];
  }
}

export default VerificationWizard;
