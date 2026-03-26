
-- API keys for agents/agencies
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key text NOT NULL UNIQUE DEFAULT ('pk_' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  name text NOT NULL DEFAULT 'Default',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- API subscriptions per LGA
CREATE TABLE public.api_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lga text NOT NULL,
  state text NOT NULL,
  amount bigint NOT NULL DEFAULT 10000,
  status text NOT NULL DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  paystack_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lga, state)
);

-- API request logs
CREATE TABLE public.api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES public.api_keys(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  lga text,
  state text,
  status_code integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- api_keys policies
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- api_subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.api_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own subscriptions" ON public.api_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" ON public.api_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- api_request_logs policies
CREATE POLICY "Users can view own logs" ON public.api_request_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs" ON public.api_request_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_api_keys_key ON public.api_keys(api_key);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_subscriptions_user ON public.api_subscriptions(user_id);
CREATE INDEX idx_api_subscriptions_lga ON public.api_subscriptions(lga, state);
CREATE INDEX idx_api_request_logs_user ON public.api_request_logs(user_id);
