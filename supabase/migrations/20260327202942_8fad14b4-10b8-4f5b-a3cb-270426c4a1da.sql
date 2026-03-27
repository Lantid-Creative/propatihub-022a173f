
CREATE TABLE public.tenant_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_number text NOT NULL,
  bank_code text NOT NULL,
  bank_name text NOT NULL,
  account_name text,
  is_verified boolean NOT NULL DEFAULT false,
  paystack_recipient_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_bank_details ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX tenant_bank_details_user_id_idx ON public.tenant_bank_details (user_id);

CREATE POLICY "Users can view own bank details"
  ON public.tenant_bank_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank details"
  ON public.tenant_bank_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank details"
  ON public.tenant_bank_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bank details"
  ON public.tenant_bank_details FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access"
  ON public.tenant_bank_details FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
