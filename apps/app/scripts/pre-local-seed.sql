-- ==============================================================================
-- Petit Diari — SEED PRE LOCAL (mínimo para desarrollo)
--
-- Ejecutar en Supabase Studio local (http://localhost:8000) → SQL Editor.
-- Se puede repetir: borra y recrea solo este centro PRE.
--
-- Credenciales (todas con la misma contraseña):
--   Directora:  directora@pre.local          / Pre-Test2026!
--   Profe 1:    profe1@pre.local             / Pre-Test2026!
--   Profe 2:    profe2@pre.local             / Pre-Test2026!
--   Madre:      mama.martina@pre.local       / Pre-Test2026!
--
-- ⚠️ Solo para PRE. No ejecutar en PRO con datos reales.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
  v_school_id UUID := 'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b1b1b1';
  v_admin_id  UUID := 'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b10001';
  v_t1_id     UUID := 'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b10002';
  v_t2_id     UUID := 'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b10003';
  v_g1_id     UUID := 'b1b1b1b1-b1b1-41b1-81b1-b1b1b1b10011';
  v_c1_id     UUID := 'c1c1c1c1-c1c1-41c1-81c1-c1c1c1c10001';
  v_s1 UUID := 'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d10001';
  v_s2 UUID := 'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d10002';
  v_s3 UUID := 'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d10003';
  v_s4 UUID := 'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d10004';
  v_s5 UUID := 'd1d1d1d1-d1d1-41d1-81d1-d1d1d1d10005';
  v_pwd TEXT := 'Pre-Test2026!';
  v_instance UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Neteja només d'aquest centre PRE
  DELETE FROM public.events_announcements WHERE school_id = v_school_id;
  DELETE FROM public.classroom_daily_notes WHERE school_id = v_school_id;
  DELETE FROM public.daily_logs WHERE school_id = v_school_id;
  DELETE FROM public.messages WHERE school_id = v_school_id;
  DELETE FROM public.student_guardians WHERE student_id IN (SELECT id FROM public.students WHERE school_id = v_school_id);
  DELETE FROM public.students WHERE school_id = v_school_id;
  DELETE FROM public.classrooms WHERE school_id = v_school_id;
  DELETE FROM public.profiles WHERE school_id = v_school_id;
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@pre.local'
  );
  DELETE FROM auth.users WHERE email LIKE '%@pre.local';
  DELETE FROM public.schools WHERE id = v_school_id;

  INSERT INTO public.schools (id, name, slug, address, phone, email, contact_email, settings)
  VALUES (
    v_school_id,
    'PRE — Escola Test',
    'pre-local',
    'Carrer de Prova, 1 · Local',
    '+34 900 000 000',
    'info@pre.local',
    'directora@pre.local',
    jsonb_build_object(
      'ops', jsonb_build_object('active', true),
      'billing', jsonb_build_object('monthly_price', 0, 'notes', 'Entorn PRE local')
    )
  );

  -- Helper inline: usuari Auth + identity + profile
  -- Directora
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_admin_id, v_instance, 'directora@pre.local',
    extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'admin'),
    jsonb_build_object('full_name', 'Anna Directora', 'email', 'directora@pre.local', 'email_verified', true, 'sub', v_admin_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_admin_id, v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'directora@pre.local', 'email_verified', true),
    'email', 'directora@pre.local', now(), now(), now()
  );
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES (v_admin_id, v_school_id, 'admin', 'Anna Directora', 'directora@pre.local', '600 100 001', 'active', false, true);

  -- Profe 1
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_t1_id, v_instance, 'profe1@pre.local',
    extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'),
    jsonb_build_object('full_name', 'Laia Profe', 'email', 'profe1@pre.local', 'email_verified', true, 'sub', v_t1_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_t1_id, v_t1_id,
    jsonb_build_object('sub', v_t1_id::text, 'email', 'profe1@pre.local', 'email_verified', true),
    'email', 'profe1@pre.local', now(), now(), now()
  );
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES (v_t1_id, v_school_id, 'teacher', 'Laia Profe', 'profe1@pre.local', '', 'active', false, true);

  -- Profe 2
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_t2_id, v_instance, 'profe2@pre.local',
    extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'),
    jsonb_build_object('full_name', 'Marc Profe', 'email', 'profe2@pre.local', 'email_verified', true, 'sub', v_t2_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_t2_id, v_t2_id,
    jsonb_build_object('sub', v_t2_id::text, 'email', 'profe2@pre.local', 'email_verified', true),
    'email', 'profe2@pre.local', now(), now(), now()
  );
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES (v_t2_id, v_school_id, 'teacher', 'Marc Profe', 'profe2@pre.local', '', 'active', false, true);

  -- Aula
  INSERT INTO public.classrooms (id, school_id, name, level, capacity, teacher_id, status)
  VALUES (v_c1_id, v_school_id, 'Aula Sol', 'I1', 12, v_t1_id, 'active');

  -- 5 infants
  INSERT INTO public.students (id, school_id, first_name, last_name, classroom_id, date_of_birth, status)
  VALUES
    (v_s1, v_school_id, 'Martina', 'Soler', v_c1_id, '2024-02-10', 'active'),
    (v_s2, v_school_id, 'Pol', 'García', v_c1_id, '2024-05-01', 'active'),
    (v_s3, v_school_id, 'Júlia', 'Martí', v_c1_id, '2023-11-20', 'active'),
    (v_s4, v_school_id, 'Arnau', 'Puig', v_c1_id, '2024-01-15', 'active'),
    (v_s5, v_school_id, 'Laia', 'Ferrer', v_c1_id, '2023-08-08', 'active');

  -- Mare de Martina (únic infant amb família)
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_g1_id, v_instance, 'mama.martina@pre.local',
    extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'),
    jsonb_build_object('full_name', 'Carla Soler', 'email', 'mama.martina@pre.local', 'email_verified', true, 'sub', v_g1_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_g1_id, v_g1_id,
    jsonb_build_object('sub', v_g1_id::text, 'email', 'mama.martina@pre.local', 'email_verified', true),
    'email', 'mama.martina@pre.local', now(), now(), now()
  );
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES (v_g1_id, v_school_id, 'guardian', 'Carla Soler', 'mama.martina@pre.local', '600 200 001', 'active', false, true);

  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES (v_s1, v_g1_id, 'mother', true);

  RAISE NOTICE 'PRE seed OK. Login: directora@pre.local / Pre-Test2026!';
END $$;
