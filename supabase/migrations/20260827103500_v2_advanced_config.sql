-- Migración para V2: Configuración Avanzada

-- 1. Añadir enum de género
CREATE TYPE student_gender AS ENUM ('boy', 'girl', 'other');

-- 2. Modificar tabla students
ALTER TABLE students 
ADD COLUMN gender student_gender,
ADD COLUMN intolerances TEXT;

-- 3. Modificar tabla schools para settings
ALTER TABLE schools 
ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

-- 4. Tabla de control de asistencia de personal (staff_attendance)
CREATE TYPE staff_attendance_status AS ENUM ('present', 'absent', 'sick', 'holiday');

CREATE TABLE staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status staff_attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(staff_id, date)
);

CREATE INDEX idx_staff_attendance_school ON staff_attendance(school_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(date DESC);

-- Trigger para updated_at en staff_attendance
CREATE TRIGGER set_staff_attendance_updated_at
  BEFORE UPDATE ON staff_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS para staff_attendance
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

-- Admins pueden verlo y editarlo todo en su escuela
CREATE POLICY "staff_attendance_admin_all"
ON staff_attendance
FOR ALL TO authenticated
USING (
  school_id = auth_school_id() 
  AND auth_role() = 'admin'
)
WITH CHECK (
  school_id = auth_school_id() 
  AND auth_role() = 'admin'
);

-- Staff puede ver su propia asistencia
CREATE POLICY "staff_attendance_staff_select"
ON staff_attendance
FOR SELECT TO authenticated
USING (
  staff_id = auth.uid()
);
