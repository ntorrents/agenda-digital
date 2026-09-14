-- Storage buckets PRE (fotos agenda, menús PDF, logos)
-- Ejecutar en Studio local: http://localhost:8000 → SQL Editor
-- (PRO normalmente ya los tiene; si faltan, también se puede aplicar allí.)

-- 1) Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-photos',
  'daily-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-documents',
  'school-documents',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-assets',
  'school-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Policies (idempotentes)
-- Requiere public.auth_role() (en esquema_pro / seeds).

DROP POLICY IF EXISTS "photos_select_authenticated" ON storage.objects;
CREATE POLICY "photos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'daily-photos');

DROP POLICY IF EXISTS "photos_insert_staff" ON storage.objects;
CREATE POLICY "photos_insert_staff"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'daily-photos'
    AND public.auth_role() = ANY (ARRAY['admin'::text, 'teacher'::text, 'auxiliary'::text])
  );

DROP POLICY IF EXISTS "photos_delete_admin" ON storage.objects;
CREATE POLICY "photos_delete_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'daily-photos' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "docs_select_all" ON storage.objects;
CREATE POLICY "docs_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-documents');

DROP POLICY IF EXISTS "docs_insert_admin" ON storage.objects;
CREATE POLICY "docs_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-documents' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "docs_update_admin" ON storage.objects;
CREATE POLICY "docs_update_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'school-documents' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "docs_delete_admin" ON storage.objects;
CREATE POLICY "docs_delete_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'school-documents' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "assets_select_all" ON storage.objects;
CREATE POLICY "assets_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');

DROP POLICY IF EXISTS "assets_insert_admin" ON storage.objects;
CREATE POLICY "assets_insert_admin"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-assets' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "assets_update_admin" ON storage.objects;
CREATE POLICY "assets_update_admin"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'school-assets' AND public.auth_role() = 'admin');

DROP POLICY IF EXISTS "assets_delete_admin" ON storage.objects;
CREATE POLICY "assets_delete_admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'school-assets' AND public.auth_role() = 'admin');

-- Verificar:
-- SELECT id, public, file_size_limit FROM storage.buckets
--   WHERE id IN ('daily-photos','school-documents','school-assets');
