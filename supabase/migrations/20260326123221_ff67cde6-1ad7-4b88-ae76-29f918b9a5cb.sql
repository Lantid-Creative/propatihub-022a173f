
-- Table to store digital tenant records/documentation
CREATE TABLE public.tenant_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid NOT NULL,
  landlord_id uuid NOT NULL,
  
  -- Personal Information
  full_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  marital_status text,
  nationality text DEFAULT 'Nigerian',
  state_of_origin text,
  
  -- Identification
  id_type text, -- NIN, Passport, Driver's License, Voter's Card
  id_number text,
  id_expiry_date date,
  id_document_url text,
  
  -- Employment
  occupation text,
  employer_name text,
  employer_address text,
  employer_phone text,
  monthly_income bigint,
  
  -- Next of Kin
  nok_full_name text,
  nok_relationship text,
  nok_phone text,
  nok_email text,
  nok_address text,
  
  -- Guarantor
  guarantor_full_name text,
  guarantor_phone text,
  guarantor_email text,
  guarantor_address text,
  guarantor_occupation text,
  guarantor_id_url text,
  
  -- Previous Tenancy
  previous_address text,
  previous_landlord_name text,
  previous_landlord_phone text,
  reason_for_leaving text,
  
  -- Emergency Contact
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  
  -- Passport photo
  passport_photo_url text,
  
  -- Meta
  notes text,
  status text NOT NULL DEFAULT 'draft', -- draft, submitted, verified
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenant_records ENABLE ROW LEVEL SECURITY;

-- Landlords can manage records for their tenancies
CREATE POLICY "Landlords can manage tenant records"
  ON public.tenant_records FOR ALL
  TO authenticated
  USING (landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Tenants can view and update their own records
CREATE POLICY "Tenants can view own records"
  ON public.tenant_records FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can update own records"
  ON public.tenant_records FOR UPDATE
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can insert own records"
  ON public.tenant_records FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER update_tenant_records_updated_at
  BEFORE UPDATE ON public.tenant_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for tenant documents (ID scans, passport photos, guarantor docs)
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-documents', 'tenant-documents', false);

-- Storage RLS: landlords and tenants of the tenancy can access
CREATE POLICY "Tenancy parties can upload tenant docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tenant-documents');

CREATE POLICY "Tenancy parties can view tenant docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tenant-documents');
