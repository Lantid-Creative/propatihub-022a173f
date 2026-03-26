
ALTER TABLE public.caution_fee_escrow 
  ADD COLUMN IF NOT EXISTS release_requested_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS release_rejected_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS release_rejected_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_release_at timestamptz DEFAULT NULL;
