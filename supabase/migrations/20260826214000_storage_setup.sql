-- ============================================
-- Pas A Pas / Agenda Bressol
-- Storage Bucket & Policies para Fotos Diarias
-- ============================================

-- Crear bucket privado para las fotos diarias de los alumnos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-photos',
  'daily-photos',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Solo staff del colegio (admin, teacher) puede subir fotos
CREATE POLICY "photos_insert_staff"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'daily-photos'
    AND auth_role() IN ('admin', 'teacher')
  );

-- Usuarios autenticados pueden ver fotos
CREATE POLICY "photos_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'daily-photos'
  );

-- Solo admin puede borrar fotos
CREATE POLICY "photos_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'daily-photos'
    AND auth_role() = 'admin'
  );
