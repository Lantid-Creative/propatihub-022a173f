
-- Allow tenants to update their own escrow to request release
CREATE POLICY "Tenants can request payout"
ON public.caution_fee_escrow
FOR UPDATE
TO authenticated
USING (tenant_id = auth.uid() AND escrow_status = 'held')
WITH CHECK (tenant_id = auth.uid());
