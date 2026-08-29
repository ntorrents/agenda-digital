-- ============================================
-- Feature Update: Status, Menus, Agenda, Passwords
-- ============================================

-- 1. Create Status Enum
CREATE TYPE record_status AS ENUM ('active', 'inactive', 'paused');

-- 2. Add status column and migrate data from is_active
ALTER TABLE profiles ADD COLUMN status record_status NOT NULL DEFAULT 'active';
UPDATE profiles SET status = CASE WHEN is_active THEN 'active'::record_status ELSE 'inactive'::record_status END;
ALTER TABLE profiles DROP COLUMN is_active;

ALTER TABLE classrooms ADD COLUMN status record_status NOT NULL DEFAULT 'active';
UPDATE classrooms SET status = CASE WHEN is_active THEN 'active'::record_status ELSE 'inactive'::record_status END;
ALTER TABLE classrooms DROP COLUMN is_active;

ALTER TABLE students ADD COLUMN status record_status NOT NULL DEFAULT 'active';
UPDATE students SET status = CASE WHEN is_active THEN 'active'::record_status ELSE 'inactive'::record_status END;
ALTER TABLE students DROP COLUMN is_active;

-- 3. Add Force Password Reset
ALTER TABLE profiles ADD COLUMN force_password_reset BOOLEAN NOT NULL DEFAULT false;

-- 4. Create Dining Menus Table
CREATE TABLE dining_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  title TEXT,
  description TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, month, year)
);

CREATE INDEX idx_dining_menus_school ON dining_menus(school_id);

-- RLS for Dining Menus
ALTER TABLE dining_menus ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los menús de su escuela
CREATE POLICY "dining_menus_select_school"
  ON dining_menus FOR SELECT
  TO authenticated
  USING (school_id = auth_school_id());

-- Solo admin puede modificar
CREATE POLICY "dining_menus_modify_admin"
  ON dining_menus FOR ALL
  TO authenticated
  USING (school_id = auth_school_id() AND auth_role() = 'admin')
  WITH CHECK (school_id = auth_school_id() AND auth_role() = 'admin');

-- 5. Storage Bucket for Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-documents',
  'school-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "docs_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-documents');

CREATE POLICY "docs_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-documents' AND auth_role() = 'admin');

CREATE POLICY "docs_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-documents' AND auth_role() = 'admin');

CREATE POLICY "docs_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-documents' AND auth_role() = 'admin');
