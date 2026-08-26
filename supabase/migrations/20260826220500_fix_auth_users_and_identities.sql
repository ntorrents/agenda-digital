-- ==============================================================================
-- Fix Auth Users & Identities for GoTrue compatibility
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
  v_school_id UUID := '11111111-1111-1111-1111-111111111111';
  v_admin_id UUID := '22222222-2222-2222-2222-222222222222';
  v_teacher_id UUID := '33333333-3333-3333-3333-333333333333';
  v_guardian_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN

  -- 1. Limpiar dependencias en orden
  DELETE FROM public.events_announcements WHERE school_id = v_school_id OR author_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM public.daily_logs WHERE school_id = v_school_id OR teacher_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM public.student_guardians WHERE guardian_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM public.students WHERE school_id = v_school_id;
  DELETE FROM public.classrooms WHERE school_id = v_school_id OR teacher_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM public.profiles WHERE school_id = v_school_id OR id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM auth.identities WHERE user_id IN (v_admin_id, v_teacher_id, v_guardian_id);
  DELETE FROM auth.users WHERE id IN (v_admin_id, v_teacher_id, v_guardian_id) OR email IN ('admin@bressol.cat', 'educadora@bressol.cat', 'familia@bressol.cat', 'test_new@bressol.cat');

  -- 2. Insertar Admin
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'admin'),
    jsonb_build_object('full_name', 'Marta Rovira (Directora)', 'email', 'admin@bressol.cat', 'email_verified', true, 'sub', v_admin_id::text),
    'authenticated',
    'authenticated',
    false,
    now(),
    now(),
    NULL,
    '',
    '',
    '',
    '',
    false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id,
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@bressol.cat', 'email_verified', true, 'phone_verified', false),
    'email',
    v_admin_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Insertar Educadora
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_teacher_id,
    '00000000-0000-0000-0000-000000000000',
    'educadora@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'),
    jsonb_build_object('full_name', 'Clara Soler (Educadora)', 'email', 'educadora@bressol.cat', 'email_verified', true, 'sub', v_teacher_id::text),
    'authenticated',
    'authenticated',
    false,
    now(),
    now(),
    NULL,
    '',
    '',
    '',
    '',
    false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_teacher_id,
    v_teacher_id,
    jsonb_build_object('sub', v_teacher_id::text, 'email', 'educadora@bressol.cat', 'email_verified', true, 'phone_verified', false),
    'email',
    v_teacher_id::text,
    now(),
    now(),
    now()
  );

  -- 4. Insertar Familia
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_guardian_id,
    '00000000-0000-0000-0000-000000000000',
    'familia@bressol.cat',
    extensions.crypt('123456', extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'),
    jsonb_build_object('full_name', 'Jordi Puig (Pare)', 'email', 'familia@bressol.cat', 'email_verified', true, 'sub', v_guardian_id::text),
    'authenticated',
    'authenticated',
    false,
    now(),
    now(),
    NULL,
    '',
    '',
    '',
    '',
    false
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_guardian_id,
    v_guardian_id,
    jsonb_build_object('sub', v_guardian_id::text, 'email', 'familia@bressol.cat', 'email_verified', true, 'phone_verified', false),
    'email',
    v_guardian_id::text,
    now(),
    now(),
    now()
  );

  -- 5. Insertar Profiles
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone)
  VALUES 
    (v_admin_id, v_school_id, 'admin', 'Marta Rovira', 'admin@bressol.cat', '+34 600 111 222'),
    (v_teacher_id, v_school_id, 'teacher', 'Clara Soler', 'educadora@bressol.cat', '+34 600 333 444'),
    (v_guardian_id, v_school_id, 'guardian', 'Jordi Puig', 'familia@bressol.cat', '+34 600 555 666');

  -- 6. Insertar Aulas
  INSERT INTO public.classrooms (id, school_id, name, level, teacher_id, capacity)
  VALUES
    ('55555555-5555-5555-5555-555555555551', v_school_id, 'Gira-sols', 'I1', v_teacher_id, 12),
    ('55555555-5555-5555-5555-555555555552', v_school_id, 'Baldufes', 'I2', NULL, 15)
  ON CONFLICT (id) DO NOTHING;

  -- 7. Insertar Alumnos
  INSERT INTO public.students (id, school_id, classroom_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES
    ('66666666-6666-6666-6666-666666666661', v_school_id, '55555555-5555-5555-5555-555555555551', 'Nil', 'Puig Valls', '2025-03-15', 'Sense al·lèrgies conegudes', 'Molt curiós i alegre'),
    ('66666666-6666-6666-6666-666666666662', v_school_id, '55555555-5555-5555-5555-555555555551', 'Mia', 'Vila Gómez', '2025-01-20', 'Intolerància a la lactosa', 'Dorm millor amb música suau'),
    ('66666666-6666-6666-6666-666666666663', v_school_id, '55555555-5555-5555-5555-555555555551', 'Leo', 'Martín Costa', '2025-05-10', NULL, NULL),
    ('66666666-6666-6666-6666-666666666664', v_school_id, '55555555-5555-5555-5555-555555555552', 'Emma', 'Bosch Ferrer', '2024-09-02', 'Al·lèrgia als fruits secs', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- 8. Vincular Tutor con Alumno
  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES
    ('66666666-6666-6666-6666-666666666661', v_guardian_id, 'father', true)
  ON CONFLICT (id) DO NOTHING;

  -- 9. Insertar Anuncio
  INSERT INTO public.events_announcements (
    school_id, author_id, title, description, event_type, audience, event_date, is_pinned
  ) VALUES (
    v_school_id, v_admin_id,
    'Festa de la Primavera',
    'Divendres vinent celebrarem la festa de benvinguda a la primavera. Podeu portar els infants amb roba de colors!',
    'event', 'school', CURRENT_DATE + INTERVAL '5 days', true
  );

END $$;
