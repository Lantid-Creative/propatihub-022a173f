
-- Add 'bid' to listing_type enum
ALTER TYPE public.listing_type ADD VALUE IF NOT EXISTS 'bid';

-- Create bids table
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL,
  amount bigint NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Everyone can view bids on active bid properties
CREATE POLICY "Anyone can view bids on bid properties" ON public.bids
  FOR SELECT TO public
  USING (true);

-- Authenticated users can place bids
CREATE POLICY "Authenticated users can place bids" ON public.bids
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = bidder_id);

-- Users can update own bids (e.g. withdraw)
CREATE POLICY "Users can update own bids" ON public.bids
  FOR UPDATE TO public
  USING (auth.uid() = bidder_id);

-- Property agents/admins can manage bids
CREATE POLICY "Agents and admins can manage bids" ON public.bids
  FOR ALL TO public
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.properties WHERE id = property_id AND agent_id = auth.uid()
    )
  );

-- Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- Add updated_at trigger
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
