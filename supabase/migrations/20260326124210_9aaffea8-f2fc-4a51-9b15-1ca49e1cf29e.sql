
CREATE TABLE public.legal_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenancy_id UUID REFERENCES public.tenancies(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  landlord_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'tenancy_agreement',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_via TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage contracts" ON public.legal_contracts
  FOR ALL TO authenticated
  USING (landlord_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tenants can view own contracts" ON public.legal_contracts
  FOR SELECT TO authenticated
  USING (tenant_id = auth.uid());

CREATE TRIGGER update_legal_contracts_updated_at
  BEFORE UPDATE ON public.legal_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
