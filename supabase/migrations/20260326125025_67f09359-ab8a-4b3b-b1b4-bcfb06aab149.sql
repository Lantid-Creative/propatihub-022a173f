
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenancy_id UUID REFERENCES public.tenancies(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  filed_by UUID NOT NULL,
  filed_against UUID,
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Filers can view and create their own disputes
CREATE POLICY "Users can file disputes" ON public.disputes
  FOR INSERT TO authenticated
  WITH CHECK (filed_by = auth.uid());

CREATE POLICY "Users can view own disputes" ON public.disputes
  FOR SELECT TO authenticated
  USING (
    filed_by = auth.uid() 
    OR filed_against = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can update own open disputes" ON public.disputes
  FOR UPDATE TO authenticated
  USING (
    (filed_by = auth.uid() AND status = 'open') 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
