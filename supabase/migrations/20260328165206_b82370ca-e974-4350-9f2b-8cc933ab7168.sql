-- Verification status enum
CREATE TYPE public.verification_status AS ENUM (
  'not_started', 'in_progress', 'awaiting_liveness', 'awaiting_documents',
  'pending_review', 'under_manual_review', 'approved', 'rejected',
  'needs_resubmission', 'expired', 'suspended'
);

-- Verification type enum
CREATE TYPE public.verification_type AS ENUM (
  'customer', 'owner', 'agent', 'agency', 'api_partner'
);

-- Main verification_profiles table
CREATE TABLE public.verification_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  verification_type public.verification_type NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'not_started',
  full_legal_name text,
  date_of_birth date,
  phone text,
  country text DEFAULT 'Nigeria',
  id_type text,
  id_number_hash text,
  id_number_masked text,
  residential_address text,
  bvn_hash text,
  bvn_masked text,
  nin_hash text,
  nin_masked text,
  agent_license_number text,
  business_name text,
  cac_registration_number text,
  business_address text,
  director_full_name text,
  director_phone text,
  tin_number text,
  company_name text,
  business_type text,
  contact_person text,
  technical_use_case text,
  liveness_score numeric,
  face_match_score numeric,
  liveness_session_id text,
  biometric_verified boolean DEFAULT false,
  reviewer_id uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  resubmission_notes text,
  admin_notes text,
  biometric_consent boolean DEFAULT false,
  document_consent boolean DEFAULT false,
  consent_timestamp timestamptz,
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  submitted_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, verification_type)
);

-- Verification documents table
CREATE TABLE public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES public.verification_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  status text DEFAULT 'uploaded',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Verification audit logs
CREATE TABLE public.verification_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES public.verification_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  actor_id uuid,
  actor_role text,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Biometric verifications
CREATE TABLE public.biometric_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES public.verification_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  session_id text,
  liveness_score numeric,
  face_match_score numeric,
  liveness_passed boolean DEFAULT false,
  face_match_passed boolean DEFAULT false,
  error_code text,
  error_message text,
  attempt_number integer DEFAULT 1,
  image_path text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.verification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification" ON public.verification_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own verification" ON public.verification_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own in-progress verification" ON public.verification_profiles
  FOR UPDATE TO authenticated
  USING ((user_id = auth.uid() AND status NOT IN ('approved', 'suspended')) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own documents" ON public.verification_documents
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own documents" ON public.verification_documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own documents" ON public.verification_documents
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own documents" ON public.verification_documents
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view own audit logs" ON public.verification_audit_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.verification_audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view own biometrics" ON public.biometric_verifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own biometrics" ON public.biometric_verifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('verification-id-documents', 'verification-id-documents', false),
  ('verification-selfies', 'verification-selfies', false),
  ('verification-business-documents', 'verification-business-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own verification docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('verification-id-documents', 'verification-selfies', 'verification-business-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users view own verification docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('verification-id-documents', 'verification-selfies', 'verification-business-documents')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Users delete own verification docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('verification-id-documents', 'verification-selfies', 'verification-business-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Triggers
CREATE TRIGGER update_verification_profiles_updated_at
  BEFORE UPDATE ON public.verification_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function
CREATE OR REPLACE FUNCTION public.is_verified(_user_id uuid, _type public.verification_type)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.verification_profiles
    WHERE user_id = _user_id AND verification_type = _type AND status = 'approved'
  )
$$;