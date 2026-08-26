-- ============================================
-- Pas A Pas / Agenda Bressol
-- Script SQL completo para Supabase
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- 1. EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'guardian');
CREATE TYPE classroom_level AS ENUM ('I0', 'I1', 'I2');
CREATE TYPE mood AS ENUM ('happy', 'calm', 'sad', 'irritable');
CREATE TYPE meal_amount AS ENUM ('all', 'most', 'little', 'none');
CREATE TYPE diaper_type AS ENUM ('pee', 'poo', 'both', 'dry');
CREATE TYPE guardian_relation AS ENUM ('mother', 'father', 'tutor', 'other');
CREATE TYPE event_type AS ENUM ('event', 'announcement', 'alert');
CREATE TYPE event_audience AS ENUM ('school', 'classroom', 'individual');

-- ============================================
-- 3. TABLAS
-- ============================================

-- Centros educativos (raíz multi-tenant)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_schools_slug ON schools(slug);

-- Perfiles de usuario (vinculados a auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'guardian',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_profiles_school ON profiles(school_id);
CREATE INDEX idx_profiles_role ON profiles(school_id, role);

-- Aulas
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level classroom_level NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  capacity INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(school_id, name)
);

CREATE INDEX idx_classrooms_school ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);

-- Alumnos
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  avatar_url TEXT,
  allergies TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_classroom ON students(classroom_id);

-- Relación tutores-alumnos (M:N)
CREATE TABLE student_guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relation guardian_relation NOT NULL DEFAULT 'tutor',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(student_id, guardian_id)
);

CREATE INDEX idx_student_guardians_student ON student_guardians(student_id);
CREATE INDEX idx_student_guardians_guardian ON student_guardians(guardian_id);

-- Registros diarios individuales
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- Estado de ánimo
  mood mood,

  -- Alimentación
  meal_breakfast meal_amount,
  meal_lunch meal_amount,
  meal_snack meal_amount,

  -- Pañal
  diaper_type diaper_type,
  diaper_changes INT NOT NULL DEFAULT 0,

  -- Siesta
  nap_start TIME,
  nap_end TIME,

  -- Fotos y notas
  photos TEXT[] DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Un registro por alumno por día
  UNIQUE(student_id, date)
);

CREATE INDEX idx_daily_logs_school ON daily_logs(school_id);
CREATE INDEX idx_daily_logs_student_date ON daily_logs(student_id, date DESC);
CREATE INDEX idx_daily_logs_classroom_date ON daily_logs(classroom_id, date DESC);
CREATE INDEX idx_daily_logs_date ON daily_logs(date DESC);

-- Eventos y anuncios
CREATE TABLE events_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'announcement',
  audience event_audience NOT NULL DEFAULT 'school',
  event_date DATE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_events_school ON events_announcements(school_id);
CREATE INDEX idx_events_classroom ON events_announcements(classroom_id);
CREATE INDEX idx_events_date ON events_announcements(event_date DESC);

-- ============================================
-- 4. TRIGGER: auto-actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. FUNCIÓN AUXILIAR: obtener school_id del JWT
-- ============================================
CREATE OR REPLACE FUNCTION auth_school_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$ LANGUAGE sql STABLE;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- ---- SCHOOLS ----
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "school_select_own"
  ON schools FOR SELECT
  TO authenticated
  USING (id = auth_school_id());

CREATE POLICY "school_update_admin"
  ON schools FOR UPDATE
  TO authenticated
  USING (id = auth_school_id() AND auth_role() = 'admin')
  WITH CHECK (id = auth_school_id() AND auth_role() = 'admin');

-- ---- PROFILES ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin ve todos los perfiles de su colegio
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() = 'admin'
  );

-- Teacher ve su propio perfil + guardians de sus alumnos
CREATE POLICY "profiles_select_teacher"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND (
      id = auth.uid()
      OR auth_role() = 'teacher'
    )
  );

-- Guardian solo ve su propio perfil
CREATE POLICY "profiles_select_guardian"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    AND auth_role() = 'guardian'
  );

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin puede insertar/modificar perfiles de su colegio
CREATE POLICY "profiles_insert_admin"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = auth_school_id()
    AND auth_role() = 'admin'
  );

-- ---- CLASSROOMS ----
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classrooms_select_school"
  ON classrooms FOR SELECT
  TO authenticated
  USING (school_id = auth_school_id());

CREATE POLICY "classrooms_modify_admin"
  ON classrooms FOR ALL
  TO authenticated
  USING (school_id = auth_school_id() AND auth_role() = 'admin')
  WITH CHECK (school_id = auth_school_id() AND auth_role() = 'admin');

-- ---- STUDENTS ----
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Admin y teacher ven todos los alumnos de su colegio
CREATE POLICY "students_select_staff"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  );

-- Guardian solo ve a sus propios hijos
CREATE POLICY "students_select_guardian"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() = 'guardian'
    AND id IN (
      SELECT student_id FROM student_guardians
      WHERE guardian_id = auth.uid()
    )
  );

-- Admin puede CRUD de alumnos
CREATE POLICY "students_modify_admin"
  ON students FOR ALL
  TO authenticated
  USING (school_id = auth_school_id() AND auth_role() = 'admin')
  WITH CHECK (school_id = auth_school_id() AND auth_role() = 'admin');

-- ---- STUDENT_GUARDIANS ----
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_guardians_select_staff"
  ON student_guardians FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_id
      AND s.school_id = auth_school_id()
    )
    AND auth_role() IN ('admin', 'teacher')
  );

CREATE POLICY "student_guardians_select_own"
  ON student_guardians FOR SELECT
  TO authenticated
  USING (guardian_id = auth.uid());

CREATE POLICY "student_guardians_modify_admin"
  ON student_guardians FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_id
      AND s.school_id = auth_school_id()
    )
    AND auth_role() = 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_id
      AND s.school_id = auth_school_id()
    )
    AND auth_role() = 'admin'
  );

-- ---- DAILY_LOGS ----
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Admin y teacher ven logs de su colegio
CREATE POLICY "daily_logs_select_staff"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  );

-- Guardian solo ve logs de sus hijos
CREATE POLICY "daily_logs_select_guardian"
  ON daily_logs FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() = 'guardian'
    AND student_id IN (
      SELECT student_id FROM student_guardians
      WHERE guardian_id = auth.uid()
    )
  );

-- Teacher puede crear/editar logs de su colegio
CREATE POLICY "daily_logs_insert_teacher"
  ON daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
    AND teacher_id = auth.uid()
  );

CREATE POLICY "daily_logs_update_teacher"
  ON daily_logs FOR UPDATE
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  )
  WITH CHECK (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  );

-- Admin puede borrar logs
CREATE POLICY "daily_logs_delete_admin"
  ON daily_logs FOR DELETE
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() = 'admin'
  );

-- ---- EVENTS_ANNOUNCEMENTS ----
ALTER TABLE events_announcements ENABLE ROW LEVEL SECURITY;

-- Todos del colegio ven eventos del colegio
CREATE POLICY "events_select_school"
  ON events_announcements FOR SELECT
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND (
      audience = 'school'
      OR (
        audience = 'classroom'
        AND classroom_id IN (
          -- El usuario pertenece a este aula (como teacher o como guardian con hijo)
          SELECT id FROM classrooms WHERE school_id = auth_school_id()
        )
      )
    )
  );

-- Admin y teacher pueden crear/editar eventos
CREATE POLICY "events_modify_staff"
  ON events_announcements FOR ALL
  TO authenticated
  USING (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  )
  WITH CHECK (
    school_id = auth_school_id()
    AND auth_role() IN ('admin', 'teacher')
  );

-- ============================================
-- 7. STORAGE BUCKET (fotos privadas)
-- ============================================
-- Ejecutar por separado en Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'daily-photos',
--   'daily-photos',
--   false,
--   5242880,  -- 5MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
-- );

-- -- Solo staff del colegio puede subir fotos
-- CREATE POLICY "photos_insert_staff"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     bucket_id = 'daily-photos'
--     AND auth_role() IN ('admin', 'teacher')
--   );

-- -- Staff y guardians pueden ver fotos de su colegio
-- CREATE POLICY "photos_select_authenticated"
--   ON storage.objects FOR SELECT
--   TO authenticated
--   USING (
--     bucket_id = 'daily-photos'
--   );

-- -- Solo admin puede borrar fotos
-- CREATE POLICY "photos_delete_admin"
--   ON storage.objects FOR DELETE
--   TO authenticated
--   USING (
--     bucket_id = 'daily-photos'
--     AND auth_role() = 'admin'
--   );
