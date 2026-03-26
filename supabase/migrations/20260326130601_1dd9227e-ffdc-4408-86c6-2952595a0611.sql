
-- Fix the overly permissive INSERT policy on api_request_logs
DROP POLICY "System can insert logs" ON public.api_request_logs;

-- Only allow users to insert their own logs
CREATE POLICY "Users can insert own logs" ON public.api_request_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
