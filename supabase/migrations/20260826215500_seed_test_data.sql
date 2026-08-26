-- ==============================================================================
-- Pas A Pas / Agenda Bressol — DATOS DE PRUEBA (SEED)
-- Migración para crear escuela, usuarios de prueba, alumnos y registros diarios
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
  v_school_id UUID := '11111111-1111-1111-1111-111111111111';
  v_admin_id UUID := '22222222-2222-2222-2222-222222222222';
  v_teacher_id UUID := '33333333-3333-3333-3333-333333333333';
  v_guardian_id UUID := '44444444-4444-4444-4444-444444444444';
  
  v_class_i1_id UUID := '55555555-5555-5555-5555-555555555551';
  v_class_i2_id UUID := '55555555-5555-5555-5555-555555555552';
  
  v_student_1 UUID := '66666666-6666-6666-6666-666666666661';
  v_student_2 UUID := '66666666-6666-6666-6666-666666666662';
  v_student_3 UUID := '66666666-6666-6666-6666-666666666663';
  v_student_4 UUID := '66666666-6666-6666-6666-666666666664';

BEGIN

  -- 1. Limpieza en orden estricto de dependencias
  DELETE FROM public.events_announcements WHERE school_id = v_school_id;
  DELETE FROM public.daily_logs WHERE school_id = v_school_id;
  DELETE FROM public.student_guardians WHERE guardian_id IN (v_admin_id, v_teacher_id, v_guardian_id) OR student_id IN (v_student_1, v_student_2, v_student_3, v_student_4);
  DELETE FROM public.students WHERE school_id = v_school_id;
  DELETE FROM public.classrooms WHERE school_id = v_school_id;
  DELETE FROM public.profiles WHERE school_id = v_school_id OR id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM auth.identities WHERE user_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM auth.users WHERE id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM public.schools WHERE id = v_school_id;

  -- 2. Crear Escuela
  INSERT INTO public.schools (id, name, slug, address, phone, email)
  VALUES (
    v_school_id,
    'Escola Bressol Els Menuts',
    'els-menuts',
    'Carrer Major 12, Barcelona',
    '+34 931 234 567',
    'info@elsmenuts.cat'
  );

  -- 3. Crear Usuarios en Supabase Auth con contraseña "123456"
  -- Usuario 1: Admin
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'admin'),
    jsonb_build_object('full_name', 'Marta Rovira (Directora)'),
    'authenticated',
    'authenticated',
    false,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id,
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@bressol.cat', 'email_verified', true),
    'email',
    v_admin_id::text,
    now(),
    now(),
    now()
  );

  -- Usuario 2: Educadora
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at
  ) VALUES (
    v_teacher_id,
    '00000000-0000-0000-0000-000000000000',
    'educadora@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'),
    jsonb_build_object('full_name', 'Clara Soler (Educadora)'),
    'authenticated',
    'authenticated',
    false,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_teacher_id,
    v_teacher_id,
    jsonb_build_object('sub', v_teacher_id::text, 'email', 'educadora@bressol.cat', 'email_verified', true),
    'email',
    v_teacher_id::text,
    now(),
    now(),
    now()
  );

  -- Usuario 3: Familia / Tutor
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at
  ) VALUES (
    v_guardian_id,
    '00000000-0000-0000-0000-000000000000',
    'familia@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'),
    jsonb_build_object('full_name', 'Jordi Puig (Pare)'),
    'authenticated',
    'authenticated',
    false,
    now(),
    now()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_guardian_id,
    v_guardian_id,
    jsonb_build_object('sub', v_guardian_id::text, 'email', 'familia@bressol.cat', 'email_verified', true),
    'email',
    v_guardian_id::text,
    now(),
    now(),
    now()
  );

  -- 4. Crear Perfiles en public.profiles
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone)
  VALUES 
    (v_admin_id, v_school_id, 'admin', 'Marta Rovira', 'admin@bressol.cat', '+34 600 111 222'),
    (v_teacher_id, v_school_id, 'teacher', 'Clara Soler', 'educadora@bressol.cat', '+34 600 333 444'),
    (v_guardian_id, v_school_id, 'guardian', 'Jordi Puig', 'familia@bressol.cat', '+34 600 555 666');

  -- 5. Crear Aulas
  INSERT INTO public.classrooms (id, school_id, name, level, teacher_id, capacity)
  VALUES
    (v_class_i1_id, v_school_id, 'Gira-sols', 'I1', v_teacher_id, 12),
    (v_class_i2_id, v_school_id, 'Baldufes', 'I2', NULL, 15);

  -- 6. Crear Alumnos
  INSERT INTO public.students (id, school_id, classroom_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES
    (v_student_1, v_school_id, v_class_i1_id, 'Nil', 'Puig Valls', '2025-03-15', 'Sense al·lèrgies conegudes', 'Molt curiós i alegre'),
    (v_student_2, v_school_id, v_class_i1_id, 'Mia', 'Vila Gómez', '2025-01-20', 'Intolerància a la lactosa', 'Dorm millor amb música suau'),
    (v_student_3, v_school_id, v_class_i1_id, 'Leo', 'Martín Costa', '2025-05-10', NULL, NULL),
    (v_student_4, v_school_id, v_class_i2_id, 'Emma', 'Bosch Ferrer', '2024-09-02', 'Al·lèrgia als fruits secs', NULL);

  -- 7. Vincular Tutor con Alumno
  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES
    (v_student_1, v_guardian_id, 'father', true);

  -- 8. Registros Diarios
  INSERT INTO public.daily_logs (
    student_id, school_id, classroom_id, date, teacher_id,
    mood, meal_breakfast, meal_lunch, meal_snack,
    diaper_type, diaper_changes, nap_start, nap_end,
    notes, photos
  ) VALUES (
    v_student_1, v_school_id, v_class_i1_id, CURRENT_DATE, v_teacher_id,
    'happy', 'all', 'most', 'all',
    'both', 2, '13:00'::time, '14:30'::time,
    'Avui en Nil ha jugat molt amb les peces de construcció i ha menjat tot el dinar!',
    ARRAY['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80']
  );

  INSERT INTO public.daily_logs (
    student_id, school_id, classroom_id, date, teacher_id,
    mood, meal_breakfast, meal_lunch, meal_snack,
    diaper_type, diaper_changes, nap_start, nap_end,
    notes, photos
  ) VALUES (
    v_student_2, v_school_id, v_class_i1_id, CURRENT_DATE, v_teacher_id,
    'calm', 'most', 'all', 'most',
    'pee', 3, '12:45'::time, '14:15'::time,
    'Molt tranquil·la i participativa a l''activitat de pintura.',
    '{}'
  );

  -- 9. Anuncio
  INSERT INTO public.events_announcements (
    school_id, author_id, title, description, event_type, audience, event_date, is_pinned
  ) VALUES (
    v_school_id, v_admin_id,
    'Festa de la Primavera',
    'Divendres vinent celebrarem la festa de benvinguda a la primavera. Podeu portar els infants amb roba de colors!',
    'event', 'school', CURRENT_DATE + INTERVAL '5 days', true
  );

END $$;
