-- ============================================
-- Agenda Bressol
-- Storage Bucket & Policies para Activos del Centro (Logos, etc)
-- ============================================

-- Crear bucket público para los logos y activos de los centros
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-assets',
  'school-assets',
  true, -- PUBLIC so everyone can see the logos sin auth
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Solo administradores (directores) pueden subir y borrar assets
CREATE POLICY "assets_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'school-assets'
    AND auth_role() = 'admin'
  );

CREATE POLICY "assets_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'school-assets'
    AND auth_role() = 'admin'
  );

CREATE POLICY "assets_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'school-assets'
    AND auth_role() = 'admin'
  );
