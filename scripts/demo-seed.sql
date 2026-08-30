-- ==============================================================================
-- Petit Diari — DATOS DE PRUEBA (SEED)
--
-- Accés demo (tots amb contrasenya 123456):
--   Direcció:  d@cole.cat
--   Professor: p1@cole.cat
--   Família:   f1@cole.cat
--   Superadmin: superadmin@bressol.cat
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Superadmin: el enum user_role original no incluye este valor.
-- Convertimos a TEXT para poder insertarlo en el mismo script.
DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::text;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN school_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- El propio usuario siempre puede leer su perfil (evita bucle login → /superadmin → /login)
DO $$
BEGIN
  DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
  CREATE POLICY "profiles_select_self"
    ON public.profiles FOR SELECT TO authenticated
    USING (
      id = auth.uid()
      OR COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'superadmin'
    );
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "superadmin_read_schools" ON public.schools;
  CREATE POLICY "superadmin_read_schools"
    ON public.schools FOR SELECT TO authenticated
    USING (COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'superadmin');
EXCEPTION WHEN others THEN NULL;
END $$;

-- Migraciones daily_logs (fora del bloc principal del seed)
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

DO $$
BEGIN
  ALTER TABLE public.daily_logs ALTER COLUMN diaper_type TYPE TEXT USING diaper_type::text;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Taula i polítiques per notes globals d'aula
CREATE TABLE IF NOT EXISTS public.classroom_daily_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(classroom_id, date)
);

ALTER TABLE public.classroom_daily_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "classroom_daily_notes_select_staff" ON public.classroom_daily_notes;
  CREATE POLICY "classroom_daily_notes_select_staff"
    ON public.classroom_daily_notes FOR SELECT TO authenticated
    USING (
      school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
    );

  DROP POLICY IF EXISTS "classroom_daily_notes_select_guardian" ON public.classroom_daily_notes;
  CREATE POLICY "classroom_daily_notes_select_guardian"
    ON public.classroom_daily_notes FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.students s ON s.id = sg.student_id
        WHERE sg.guardian_id = auth.uid()
          AND s.classroom_id = classroom_daily_notes.classroom_id
      )
    );
EXCEPTION WHEN others THEN NULL;
END $$;

-- Famílies: llegir el seu vincle amb l'alumne
DO $$
BEGIN
  DROP POLICY IF EXISTS "student_guardians_select_guardian" ON public.student_guardians;
  CREATE POLICY "student_guardians_select_guardian"
    ON public.student_guardians FOR SELECT TO authenticated
    USING (guardian_id = auth.uid());
EXCEPTION WHEN others THEN NULL;
END $$;

-- Membres del centre: llegir dades de l'escola
DO $$
BEGIN
  DROP POLICY IF EXISTS "schools_select_member" ON public.schools;
  CREATE POLICY "schools_select_member"
    ON public.schools FOR SELECT TO authenticated
    USING (
      id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid() AND p.school_id IS NOT NULL)
    );
EXCEPTION WHEN others THEN NULL;
END $$;

-- Funcions helper per RLS (evitar recursió)
CREATE OR REPLACE FUNCTION public.is_my_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.student_guardians
    WHERE guardian_id = auth.uid()
      AND student_id = p_student_id
  );
END;
$function$;

-- Asegurarse de que existe la función para crear tutores
CREATE OR REPLACE FUNCTION public.create_guardian_user(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_school_id UUID,
  p_password TEXT DEFAULT '123456'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    is_anonymous, is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    p_email, extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'guardian'),
    jsonb_build_object('full_name', p_full_name, 'email', p_email, 'email_verified', true),
    now(), now(), NULL, '', '', '', '', false, false
  )
  RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (new_user_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', p_email, 'email_verified', true), 'email', new_user_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (new_user_id, p_school_id, 'guardian', p_full_name, p_email, p_phone, 'active', true);

  RETURN new_user_id;
END;
$function$;

-- Storage: buckets per fotos i documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-photos', 'daily-photos', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-documents', 'school-documents', true, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
DECLARE
  v_school_id UUID := '11111111-1111-1111-1111-111111111111';
  v_admin_id UUID := '10000000-0000-0000-0000-000000000000';
  v_p1_id UUID := '10000000-0000-0000-0000-000000000001';
  v_p2_id UUID := '10000000-0000-0000-0000-000000000002';
  v_p3_id UUID := '10000000-0000-0000-0000-000000000003';
  v_p4_id UUID := '10000000-0000-0000-0000-000000000004';
  v_p5_id UUID := '10000000-0000-0000-0000-000000000005';
  v_f1_id UUID := '10000000-0000-0000-0000-000000000006';
  v_f2_id UUID := '10000000-0000-0000-0000-000000000007';
  v_superadmin_id UUID := '10000000-0000-0000-0000-000000000099';
  
  v_c_i0_id UUID := '20000000-0000-0000-0000-000000000000';
  v_c_i1_id UUID := '20000000-0000-0000-0000-000000000001';
  v_c_i2_id UUID := '20000000-0000-0000-0000-000000000002';

BEGIN

  -- 0. APLICAR MIGRACIONES PENDIENTES QUE QUIZÁS NO TENGAS
  -- (classroom_daily_notes ja creat abans del bloc principal)
  -- Añadir columnas a profiles si no existen
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  EXCEPTION WHEN duplicate_column THEN END;
  
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN force_password_reset BOOLEAN NOT NULL DEFAULT false;
  EXCEPTION WHEN duplicate_column THEN END;
  
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN welcome_email_sent BOOLEAN NOT NULL DEFAULT false;
  EXCEPTION WHEN duplicate_column THEN END;

  -- 1. Limpieza total (Reset de datos)
  DELETE FROM public.events_announcements;
  DELETE FROM public.classroom_daily_notes;
  DELETE FROM public.daily_logs;
  DELETE FROM public.student_guardians;
  DELETE FROM public.students;
  DELETE FROM public.classrooms;
  DELETE FROM public.profiles;
  DELETE FROM auth.identities;
  DELETE FROM auth.users;
  DELETE FROM public.schools;

  -- 2. Crear Escuela
  INSERT INTO public.schools (id, name, slug, address, phone, email)
  VALUES (
    v_school_id,
    'Colegio',
    'colegio',
    'Calle Principal 1',
    '+34 900 000 000',
    'info@cole.cat'
  );

  -- 3. Usuarios
  -- Admin
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'd@cole.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'admin'),
    jsonb_build_object('full_name', 'Directora', 'email', 'd@cole.cat', 'email_verified', true, 'sub', v_admin_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_admin_id, v_admin_id, jsonb_build_object('sub', v_admin_id::text, 'email', 'd@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_admin_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (v_admin_id, v_school_id, 'admin', 'Directora', 'd@cole.cat', '', 'active', false);

  -- Profesores
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin, created_at, updated_at, phone, confirmation_token, recovery_token, email_change_token_new, email_change, is_anonymous)
  VALUES 
    (v_p1_id, '00000000-0000-0000-0000-000000000000', 'p1@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Profesor 1', 'email', 'p1@cole.cat', 'email_verified', true, 'sub', v_p1_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_p2_id, '00000000-0000-0000-0000-000000000000', 'p2@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Profesor 2', 'email', 'p2@cole.cat', 'email_verified', true, 'sub', v_p2_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_p3_id, '00000000-0000-0000-0000-000000000000', 'p3@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Profesor 3', 'email', 'p3@cole.cat', 'email_verified', true, 'sub', v_p3_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_p4_id, '00000000-0000-0000-0000-000000000000', 'p4@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Profesor 4', 'email', 'p4@cole.cat', 'email_verified', true, 'sub', v_p4_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_p5_id, '00000000-0000-0000-0000-000000000000', 'p5@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Profesor 5', 'email', 'p5@cole.cat', 'email_verified', true, 'sub', v_p5_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false);

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES 
    (v_p1_id, v_p1_id, jsonb_build_object('sub', v_p1_id::text, 'email', 'p1@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_p1_id::text, now(), now(), now()),
    (v_p2_id, v_p2_id, jsonb_build_object('sub', v_p2_id::text, 'email', 'p2@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_p2_id::text, now(), now(), now()),
    (v_p3_id, v_p3_id, jsonb_build_object('sub', v_p3_id::text, 'email', 'p3@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_p3_id::text, now(), now(), now()),
    (v_p4_id, v_p4_id, jsonb_build_object('sub', v_p4_id::text, 'email', 'p4@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_p4_id::text, now(), now(), now()),
    (v_p5_id, v_p5_id, jsonb_build_object('sub', v_p5_id::text, 'email', 'p5@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_p5_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES 
    (v_p1_id, v_school_id, 'teacher', 'Profesor 1', 'p1@cole.cat', '', 'active', false),
    (v_p2_id, v_school_id, 'teacher', 'Profesor 2', 'p2@cole.cat', '', 'active', false),
    (v_p3_id, v_school_id, 'teacher', 'Profesor 3', 'p3@cole.cat', '', 'active', false),
    (v_p4_id, v_school_id, 'teacher', 'Profesor 4', 'p4@cole.cat', '', 'active', false),
    (v_p5_id, v_school_id, 'teacher', 'Profesor 5', 'p5@cole.cat', '', 'active', false);

  -- Familias
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin, created_at, updated_at, phone, confirmation_token, recovery_token, email_change_token_new, email_change, is_anonymous)
  VALUES 
    (v_f1_id, '00000000-0000-0000-0000-000000000000', 'f1@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Familia 1', 'email', 'f1@cole.cat', 'email_verified', true, 'sub', v_f1_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_f2_id, '00000000-0000-0000-0000-000000000000', 'f2@cole.cat', extensions.crypt('123456', extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Familia 2', 'email', 'f2@cole.cat', 'email_verified', true, 'sub', v_f2_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false);

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES 
    (v_f1_id, v_f1_id, jsonb_build_object('sub', v_f1_id::text, 'email', 'f1@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_f1_id::text, now(), now(), now()),
    (v_f2_id, v_f2_id, jsonb_build_object('sub', v_f2_id::text, 'email', 'f2@cole.cat', 'email_verified', true, 'phone_verified', false), 'email', v_f2_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES 
    (v_f1_id, v_school_id, 'guardian', 'Familia 1', 'f1@cole.cat', '', 'active', false),
    (v_f2_id, v_school_id, 'guardian', 'Familia 2', 'f2@cole.cat', '', 'active', false);

  -- Superadmin (plataforma — sense centre escolar)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin, created_at, updated_at, phone, confirmation_token, recovery_token, email_change_token_new, email_change, is_anonymous)
  VALUES (
    v_superadmin_id, '00000000-0000-0000-0000-000000000000', 'superadmin@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'superadmin'),
    jsonb_build_object('full_name', 'Super Admin', 'email', 'superadmin@bressol.cat', 'email_verified', true, 'sub', v_superadmin_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_superadmin_id, v_superadmin_id, jsonb_build_object('sub', v_superadmin_id::text, 'email', 'superadmin@bressol.cat', 'email_verified', true, 'phone_verified', false), 'email', v_superadmin_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (v_superadmin_id, NULL, 'superadmin', 'Super Admin', 'superadmin@bressol.cat', '', 'active', false);

  -- Aulas
  INSERT INTO public.classrooms (id, school_id, name, level, capacity, teacher_id, auxiliary_teacher_ids, status)
  VALUES 
    (v_c_i0_id, v_school_id, 'Aula I0', 'I0', 15, v_p1_id, ARRAY[v_p4_id, v_p5_id], 'active'),
    (v_c_i1_id, v_school_id, 'Aula I1', 'I1', 15, v_p2_id, ARRAY[v_p4_id], 'active'),
    (v_c_i2_id, v_school_id, 'Aula I2', 'I2', 15, v_p3_id, ARRAY[v_p5_id], 'active');

  -- Alumnos
  INSERT INTO public.students (id, school_id, first_name, last_name, classroom_id, date_of_birth, status)
  VALUES 
    ('30000000-0000-0000-0000-000000000001', v_school_id, 'Niño 1', 'Ap 1', v_c_i0_id, '2024-01-01', 'active'),
    ('30000000-0000-0000-0000-000000000002', v_school_id, 'Niño 2', 'Ap 2', v_c_i0_id, '2024-02-01', 'active'),
    ('30000000-0000-0000-0000-000000000003', v_school_id, 'Niño 3', 'Ap 3', v_c_i0_id, '2024-03-01', 'active'),
    ('30000000-0000-0000-0000-000000000004', v_school_id, 'Niño 4', 'Ap 4', v_c_i0_id, '2024-04-01', 'active'),
    ('30000000-0000-0000-0000-000000000005', v_school_id, 'Niño 5', 'Ap 5', v_c_i0_id, '2024-05-01', 'active'),
    
    ('30000000-0000-0000-0000-000000000006', v_school_id, 'Niño 6', 'Ap 6', v_c_i1_id, '2023-01-01', 'active'),
    ('30000000-0000-0000-0000-000000000007', v_school_id, 'Niño 7', 'Ap 7', v_c_i1_id, '2023-02-01', 'active'),
    ('30000000-0000-0000-0000-000000000008', v_school_id, 'Niño 8', 'Ap 8', v_c_i1_id, '2023-03-01', 'active'),
    ('30000000-0000-0000-0000-000000000009', v_school_id, 'Niño 9', 'Ap 9', v_c_i1_id, '2023-04-01', 'active'),
    ('30000000-0000-0000-0000-000000000010', v_school_id, 'Niño 10', 'Ap 10', v_c_i1_id, '2023-05-01', 'active'),
    
    ('30000000-0000-0000-0000-000000000011', v_school_id, 'Niño 11', 'Ap 11', v_c_i2_id, '2022-01-01', 'active'),
    ('30000000-0000-0000-0000-000000000012', v_school_id, 'Niño 12', 'Ap 12', v_c_i2_id, '2022-02-01', 'active'),
    ('30000000-0000-0000-0000-000000000013', v_school_id, 'Niño 13', 'Ap 13', v_c_i2_id, '2022-03-01', 'active'),
    ('30000000-0000-0000-0000-000000000014', v_school_id, 'Niño 14', 'Ap 14', v_c_i2_id, '2022-04-01', 'active'),
    ('30000000-0000-0000-0000-000000000015', v_school_id, 'Niño 15', 'Ap 15', v_c_i2_id, '2022-05-01', 'active');

  -- Asignar familia 1 al alumno 1 (I0)
  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES ('30000000-0000-0000-0000-000000000001', v_f1_id, 'father', true);

  -- Asignar familia 2 al alumno 11 (I2)
  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES ('30000000-0000-0000-0000-000000000011', v_f2_id, 'mother', true);

  -- Crear agendas para el 29 y 30 de agosto
  -- Notas Globales (Aula)
  INSERT INTO public.classroom_daily_notes (id, school_id, classroom_id, teacher_id, date, note, photo_url)
  VALUES 
    ('40000000-0000-0000-0000-000000000001', v_school_id, v_c_i0_id, v_p1_id, '2026-08-29', 'Hoy en I0 hemos jugado mucho con los colores.', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80'),
    ('40000000-0000-0000-0000-000000000002', v_school_id, v_c_i0_id, v_p1_id, '2026-08-30', 'Día fantástico en I0.', NULL),
    ('40000000-0000-0000-0000-000000000003', v_school_id, v_c_i1_id, v_p2_id, '2026-08-29', 'En I1 todos han participado en el taller musical.', NULL),
    ('40000000-0000-0000-0000-000000000005', v_school_id, v_c_i2_id, v_p3_id, '2026-08-29', 'Día divertido en I2!', NULL);

  -- Detalles de alumnos para el 29 de agosto (I0)
  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_breakfast, meal_lunch, nap_start, nap_end, notes, photos)
  VALUES 
    ('30000000-0000-0000-0000-000000000001', v_school_id, v_c_i0_id, v_p1_id, '2026-08-29', 'happy', 'all', 'most', '13:00', '14:30', 'Ha estado muy contento todo el día.', ARRAY['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80']),
    ('30000000-0000-0000-0000-000000000002', v_school_id, v_c_i0_id, v_p1_id, '2026-08-29', 'calm', NULL, 'all', NULL, NULL, 'No ha querido dormir siesta.', '{}'),
    ('30000000-0000-0000-0000-000000000003', v_school_id, v_c_i0_id, v_p1_id, '2026-08-29', 'sad', NULL, 'none', '13:30', '15:00', 'Lloró un poquito a la entrada.', '{}');

  -- Detalles de alumnos para el 30 de agosto (I0)
  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_breakfast, meal_lunch, nap_start, nap_end, notes)
  VALUES 
    ('30000000-0000-0000-0000-000000000001', v_school_id, v_c_i0_id, v_p1_id, '2026-08-30', 'happy', 'none', 'all', '13:00', '14:30', 'Se portó estupendamente.');

  -- Detalles de alumnos para el 29 de agosto (I1)
  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_lunch, nap_start, nap_end, notes, photos)
  VALUES 
    ('30000000-0000-0000-0000-000000000006', v_school_id, v_c_i1_id, v_p2_id, '2026-08-29', 'happy', 'most', '13:00', '14:30', 'Muy bien hoy.', ARRAY['https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=800&q=80']);

  -- Detalles de alumnos para el 29 de agosto (I2)
  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_lunch, notes)
  VALUES 
    ('30000000-0000-0000-0000-000000000011', v_school_id, v_c_i2_id, v_p3_id, '2026-08-29', 'happy', 'all', 'Ha sido un niño excelente.');

  -- Crear comunicados (columnes reals: event_type, audience, event_date, author_id)
  INSERT INTO public.events_announcements (id, school_id, author_id, title, description, event_type, audience, event_date, is_pinned)
  VALUES 
    ('50000000-0000-0000-0000-000000000000', v_school_id, v_admin_id, 'Reunión de inicio de curso', 'Os esperamos el día 5 de septiembre a las 17:30 para conocernos.', 'announcement', 'school', '2026-08-29', true),
    ('50000000-0000-0000-0000-000000000001', v_school_id, v_admin_id, 'Traer ropa de recambio', 'Por favor traed ropa cómoda de recambio para cuando hagamos actividades de pintura y agua.', 'announcement', 'school', '2026-08-30', false);

  -- Assegurar contrasenyes demo (les famílies poden quedar amb hash invàlid després del seed)
  UPDATE auth.users
  SET encrypted_password = extensions.crypt('123456', extensions.gen_salt('bf'))
  WHERE email IN (
    'd@cole.cat', 'p1@cole.cat', 'p2@cole.cat', 'p3@cole.cat', 'p4@cole.cat', 'p5@cole.cat',
    'f1@cole.cat', 'f2@cole.cat', 'superadmin@bressol.cat'
  );

END $$;

-- Estat del personal (actiu / pausa / inactiu)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'paused', 'inactive'));
EXCEPTION WHEN others THEN NULL;
END $$;
