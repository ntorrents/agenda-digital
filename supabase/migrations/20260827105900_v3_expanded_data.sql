-- Migración para V3: Expansión de datos de alumnos, aulas y escuelas

-- 1. Modificar tabla students
ALTER TABLE students 
ADD COLUMN authorized_pickup TEXT,
ADD COLUMN parents_phone TEXT,
ADD COLUMN internal_notes TEXT;

-- 2. Modificar tabla classrooms
-- Para array de UUIDs de educadoras de apoyo
ALTER TABLE classrooms
ADD COLUMN auxiliary_teacher_ids UUID[] DEFAULT '{}';

-- 3. Modificar tabla schools
ALTER TABLE schools
ADD COLUMN cif TEXT,
ADD COLUMN contact_email TEXT;
