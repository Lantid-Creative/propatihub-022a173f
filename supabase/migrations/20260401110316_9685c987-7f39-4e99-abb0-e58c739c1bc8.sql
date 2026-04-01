
-- 1. Fix agencies: restrict to authenticated
DROP POLICY IF EXISTS "Agencies viewable by everyone" ON public.agencies;
CREATE POLICY "Authenticated users can view agencies" ON public.agencies
  FOR SELECT TO authenticated
  USING (true);

-- 2. Fix property-images upload: enforce folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Fix floor-plans upload: enforce folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload floor plans" ON storage.objects;
CREATE POLICY "Authenticated users can upload floor plans" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Fix virtual-tours upload: enforce folder ownership
DROP POLICY IF EXISTS "Authenticated users can upload virtual tours" ON storage.objects;
CREATE POLICY "Authenticated users can upload virtual tours" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'virtual-tours' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Add DELETE policies for lease-documents
CREATE POLICY "Tenancy parties can delete lease documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'lease-documents' AND (
      EXISTS (
        SELECT 1 FROM public.tenancies t
        WHERE (t.tenant_id = auth.uid() OR t.landlord_id = auth.uid())
      )
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- 6. Add DELETE policies for tenant-documents
CREATE POLICY "Tenancy parties can delete tenant documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'tenant-documents' AND (
      EXISTS (
        SELECT 1 FROM public.tenancies t
        WHERE (t.tenant_id = auth.uid() OR t.landlord_id = auth.uid())
      )
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );
