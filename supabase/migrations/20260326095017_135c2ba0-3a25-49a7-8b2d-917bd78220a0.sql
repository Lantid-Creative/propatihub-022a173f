
-- Add new columns for enhanced property listings
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS floor_plan_url text,
  ADD COLUMN IF NOT EXISTS virtual_tour_url text,
  ADD COLUMN IF NOT EXISTS virtual_tour_video_url text,
  ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS year_built integer,
  ADD COLUMN IF NOT EXISTS parking_spaces integer,
  ADD COLUMN IF NOT EXISTS furnishing text,
  ADD COLUMN IF NOT EXISTS condition text,
  ADD COLUMN IF NOT EXISTS service_charge numeric,
  ADD COLUMN IF NOT EXISTS caution_fee numeric;

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('property-images', 'property-images', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for floor plans
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('floor-plans', 'floor-plans', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for virtual tour videos
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('virtual-tours', 'virtual-tours', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- RLS for property-images bucket
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS for floor-plans bucket
CREATE POLICY "Anyone can view floor plans"
ON storage.objects FOR SELECT
USING (bucket_id = 'floor-plans');

CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'floor-plans');

CREATE POLICY "Users can delete own floor plans"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS for virtual-tours bucket
CREATE POLICY "Anyone can view virtual tours"
ON storage.objects FOR SELECT
USING (bucket_id = 'virtual-tours');

CREATE POLICY "Authenticated users can upload virtual tours"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'virtual-tours');

CREATE POLICY "Users can delete own virtual tours"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'virtual-tours' AND (storage.foldername(name))[1] = auth.uid()::text);
