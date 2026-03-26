
-- Tenant invitations
CREATE TABLE public.tenant_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL,
  tenant_email text NOT NULL,
  tenant_name text,
  status text NOT NULL DEFAULT 'pending',
  monthly_rent bigint NOT NULL DEFAULT 0,
  caution_fee bigint NOT NULL DEFAULT 0,
  lease_start date,
  lease_end date,
  message text,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters can manage own invitations" ON public.tenant_invitations
  FOR ALL TO authenticated
  USING (invited_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tenants can view their invitations" ON public.tenant_invitations
  FOR SELECT TO authenticated
  USING (tenant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Tenants can accept invitations" ON public.tenant_invitations
  FOR UPDATE TO authenticated
  USING (tenant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Tenancies (active tenant-property relationships)
CREATE TABLE public.tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  landlord_id uuid NOT NULL,
  invitation_id uuid REFERENCES public.tenant_invitations(id),
  monthly_rent bigint NOT NULL DEFAULT 0,
  lease_start date NOT NULL,
  lease_end date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords and tenants can view tenancies" ON public.tenancies
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid() OR landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Landlords can manage tenancies" ON public.tenancies
  FOR ALL TO authenticated
  USING (landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Caution fee escrow
CREATE TABLE public.caution_fee_escrow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id),
  tenant_id uuid NOT NULL,
  landlord_id uuid NOT NULL,
  amount bigint NOT NULL,
  paystack_reference text,
  paystack_authorization_code text,
  payment_status text NOT NULL DEFAULT 'pending',
  escrow_status text NOT NULL DEFAULT 'held',
  release_requested_at timestamptz,
  release_approved_at timestamptz,
  release_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.caution_fee_escrow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view escrow" ON public.caution_fee_escrow
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid() OR landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System and landlords can manage escrow" ON public.caution_fee_escrow
  FOR ALL TO authenticated
  USING (landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tenants can insert escrow on payment" ON public.caution_fee_escrow
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.uid());

-- Rent payments
CREATE TABLE public.rent_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  amount bigint NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  paystack_reference text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view rent payments" ON public.rent_payments
  FOR SELECT TO authenticated
  USING (
    tenant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.tenancies WHERE id = tenancy_id AND landlord_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenants can insert rent payments" ON public.rent_payments
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Landlords can update rent payments" ON public.rent_payments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tenancies WHERE id = tenancy_id AND landlord_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Maintenance requests
CREATE TABLE public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  images text[],
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view maintenance" ON public.maintenance_requests
  FOR SELECT TO authenticated
  USING (
    tenant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.tenancies WHERE id = tenancy_id AND landlord_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenants can create maintenance requests" ON public.maintenance_requests
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Landlords can update maintenance" ON public.maintenance_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tenancies WHERE id = tenancy_id AND landlord_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenants can update own maintenance" ON public.maintenance_requests
  FOR UPDATE TO authenticated
  USING (tenant_id = auth.uid());

-- Lease documents
CREATE TABLE public.lease_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  document_type text NOT NULL DEFAULT 'lease',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lease_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view documents" ON public.lease_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (t.tenant_id = auth.uid() OR t.landlord_id = auth.uid())
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Landlords can manage documents" ON public.lease_documents
  FOR ALL TO authenticated
  USING (uploaded_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_tenant_invitations_updated_at BEFORE UPDATE ON public.tenant_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenancies_updated_at BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_caution_fee_escrow_updated_at BEFORE UPDATE ON public.caution_fee_escrow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON public.rent_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for lease documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lease-documents', 'lease-documents', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Tenancy parties can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lease-documents');

CREATE POLICY "Tenancy parties can view documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lease-documents');
