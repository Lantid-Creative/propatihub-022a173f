
-- Bidding subscription tiers
CREATE TABLE public.bid_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  max_property_value BIGINT,
  max_active_bids INTEGER NOT NULL DEFAULT 3,
  early_access BOOLEAN NOT NULL DEFAULT false,
  paystack_reference TEXT,
  amount BIGINT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bid_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bid subscriptions" ON public.bid_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own bid subscriptions" ON public.bid_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage bid subscriptions" ON public.bid_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Bid deposits (refundable)
CREATE TABLE public.bid_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id),
  user_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'held',
  paystack_reference TEXT,
  forfeited_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bid_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits" ON public.bid_deposits
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert deposits" ON public.bid_deposits
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage deposits" ON public.bid_deposits
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- KYC verifications
CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  bvn_verified BOOLEAN NOT NULL DEFAULT false,
  nin_verified BOOLEAN NOT NULL DEFAULT false,
  bvn_hash TEXT,
  nin_hash TEXT,
  full_name TEXT,
  date_of_birth DATE,
  proof_of_funds_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC" ON public.kyc_verifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own KYC" ON public.kyc_verifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own KYC" ON public.kyc_verifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage KYC" ON public.kyc_verifications
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Add auction fields to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS reserve_price BIGINT,
  ADD COLUMN IF NOT EXISTS auction_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auction_end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auction_auto_extend BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auction_extend_minutes INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC DEFAULT 5,
  ADD COLUMN IF NOT EXISTS winner_payment_deadline_days INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS auction_status TEXT DEFAULT 'upcoming';

-- Add winner fields to bids
ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_id UUID REFERENCES public.bid_deposits(id);
