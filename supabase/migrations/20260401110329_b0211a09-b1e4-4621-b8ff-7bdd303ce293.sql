
-- Fix page_views INSERT: scope to user's own data or allow anon with no user_id
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Fix verification_audit_logs INSERT: scope to own user_id
DROP POLICY IF EXISTS "System can insert audit logs" ON public.verification_audit_logs;
CREATE POLICY "System can insert audit logs" ON public.verification_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
