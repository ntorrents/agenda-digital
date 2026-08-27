-- ============================================
-- Fix Storage Policies (SELECT)
-- ============================================

CREATE POLICY "assets_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');
