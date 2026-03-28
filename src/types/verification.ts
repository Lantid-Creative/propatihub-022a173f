export type VerificationStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_liveness"
  | "awaiting_documents"
  | "pending_review"
  | "under_manual_review"
  | "approved"
  | "rejected"
  | "needs_resubmission"
  | "expired"
  | "suspended";

export type VerificationType = "customer" | "owner" | "agent" | "agency" | "api_partner";

export interface VerificationProfile {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  full_legal_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  country: string | null;
  id_type: string | null;
  id_number_hash: string | null;
  id_number_masked: string | null;
  residential_address: string | null;
  bvn_hash: string | null;
  bvn_masked: string | null;
  nin_hash: string | null;
  nin_masked: string | null;
  agent_license_number: string | null;
  business_name: string | null;
  cac_registration_number: string | null;
  business_address: string | null;
  director_full_name: string | null;
  director_phone: string | null;
  tin_number: string | null;
  company_name: string | null;
  business_type: string | null;
  contact_person: string | null;
  technical_use_case: string | null;
  liveness_score: number | null;
  face_match_score: number | null;
  liveness_session_id: string | null;
  biometric_verified: boolean;
  reviewer_id: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  resubmission_notes: string | null;
  admin_notes: string | null;
  biometric_consent: boolean;
  document_consent: boolean;
  consent_timestamp: string | null;
  attempt_count: number;
  max_attempts: number;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  verification_documents?: VerificationDocument[];
  user_email?: string;
}

export interface VerificationDocument {
  id: string;
  verification_id: string;
  user_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  rejection_reason: string | null;
  signed_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationAuditLog {
  id: string;
  verification_id: string;
  user_id: string;
  action: string;
  actor_id: string | null;
  actor_role: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface BiometricVerification {
  id: string;
  verification_id: string;
  user_id: string;
  session_id: string | null;
  liveness_score: number | null;
  face_match_score: number | null;
  liveness_passed: boolean;
  face_match_passed: boolean;
  error_code: string | null;
  error_message: string | null;
  attempt_number: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Step config per verification type
export interface VerificationStepConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const VERIFICATION_STEPS: Record<VerificationType, VerificationStepConfig[]> = {
  customer: [
    { id: "identity", title: "Identity Details", description: "Your basic identity information", icon: "User" },
    { id: "review", title: "Review & Submit", description: "Confirm and submit", icon: "CheckCircle" },
  ],
  owner: [
    { id: "identity", title: "Identity Details", description: "Personal identity information", icon: "User" },
    { id: "liveness", title: "Face Verification", description: "Live face verification", icon: "ScanFace" },
    { id: "documents", title: "Documents", description: "ID, proof of address, ownership", icon: "FileText" },
    { id: "review", title: "Review & Submit", description: "Confirm and submit for review", icon: "CheckCircle" },
  ],
  agent: [
    { id: "identity", title: "Identity Details", description: "Personal and license details", icon: "User" },
    { id: "liveness", title: "Face Verification", description: "Live face verification", icon: "ScanFace" },
    { id: "documents", title: "Documents", description: "ID and license certificate", icon: "FileText" },
    { id: "review", title: "Review & Submit", description: "Submit for professional review", icon: "CheckCircle" },
  ],
  agency: [
    { id: "business", title: "Business Details", description: "CAC and business information", icon: "Building2" },
    { id: "director", title: "Director Details", description: "Responsible person information", icon: "User" },
    { id: "liveness", title: "Director Face Verification", description: "Director identity check", icon: "ScanFace" },
    { id: "documents", title: "Business Documents", description: "CAC cert, director ID, proof", icon: "FileText" },
    { id: "review", title: "Review & Submit", description: "Submit for business review", icon: "CheckCircle" },
  ],
  api_partner: [
    { id: "business", title: "Company Details", description: "Business and integration info", icon: "Building2" },
    { id: "identity", title: "Contact Person", description: "Responsible officer details", icon: "User" },
    { id: "liveness", title: "Officer Face Verification", description: "Identity verification", icon: "ScanFace" },
    { id: "documents", title: "Business Documents", description: "Registration and officer ID", icon: "FileText" },
    { id: "review", title: "Review & Submit", description: "Submit for partner review", icon: "CheckCircle" },
  ],
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  awaiting_liveness: "Awaiting Face Verification",
  awaiting_documents: "Awaiting Documents",
  pending_review: "Pending Review",
  under_manual_review: "Under Review",
  approved: "Verified",
  rejected: "Rejected",
  needs_resubmission: "Resubmission Needed",
  expired: "Expired",
  suspended: "Suspended",
};

export const STATUS_COLORS: Record<VerificationStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  awaiting_liveness: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  awaiting_documents: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  pending_review: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  under_manual_review: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  approved: "bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "bg-destructive/10 text-destructive",
  needs_resubmission: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  expired: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
};
