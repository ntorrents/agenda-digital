-- ==============================================================================
-- Petit Diari — CENTRE DEMO SHOWCASE (no destructiu amb altres escoles)
--
-- Executar al SQL Editor de Supabase. Es pot repetir: esborra i recrea només el centre DEMO.
--
-- ACCÉS DIRECTORA (canvi de contrasenya obligatori al primer login):
--   Email:    directora@escola-demo.invalid
--   Password: Demo-Petit2026!
--
-- Altres usuaris (@escola-demo.invalid — correus ficticis, no s'envia res):
--   laia.roma@escola-demo.invalid      (educadora I0)
--   marc.vidal@escola-demo.invalid     (educador I1)
--   judit.serra@escola-demo.invalid    (educadora auxiliar)
--   Famílies: noms.cognoms@escola-demo.invalid (mateixa contrasenya)
--
-- Slug: demo-showcase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
  v_school_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0';
  v_admin_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00001';
  v_t1_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00002';
  v_t2_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00003';
  v_t3_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00004';
  v_g1_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00011';
  v_g2_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00012';
  v_g3_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00013';
  v_g4_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a00014';
  v_c_i0_id UUID := 'c0c0c0c0-c0c0-40c0-80c0-c0c0c0c00000';
  v_c_i1_id UUID := 'c0c0c0c0-c0c0-40c0-80c0-c0c0c0c00001';
  v_pwd TEXT := 'Demo-Petit2026!';
  v_d0 DATE := CURRENT_DATE - 2;
  v_d1 DATE := CURRENT_DATE - 1;
  v_d2 DATE := CURRENT_DATE;
BEGIN
  -- Neteja només del centre DEMO (si ja existia)
  DELETE FROM public.events_announcements WHERE school_id = v_school_id;
  DELETE FROM public.classroom_daily_notes WHERE school_id = v_school_id;
  DELETE FROM public.daily_logs WHERE school_id = v_school_id;
  DELETE FROM public.student_guardians WHERE student_id IN (SELECT id FROM public.students WHERE school_id = v_school_id);
  DELETE FROM public.students WHERE school_id = v_school_id;
  DELETE FROM public.classrooms WHERE school_id = v_school_id;
  DELETE FROM public.profiles WHERE school_id = v_school_id;
  DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@escola-demo.invalid');
  DELETE FROM auth.users WHERE email LIKE '%@escola-demo.invalid';
  DELETE FROM public.schools WHERE id = v_school_id;

  INSERT INTO public.schools (id, name, slug, address, phone, email, contact_email, settings)
  VALUES (
    v_school_id,
    'DEMO — Escola Bressol La Ginesta',
    'demo-showcase',
    'Carrer de la Flor, 12 · Terrassa',
    '+34 937 000 000',
    'info@escola-demo.invalid',
    'directora@escola-demo.invalid',
    jsonb_build_object(
      'demo', jsonb_build_object('showcase', true, 'label', 'DEMO'),
      'ops', jsonb_build_object('active', true, 'demo_school', true),
      'billing', jsonb_build_object('monthly_price', 0, 'notes', 'Centre demostració — no facturable')
    )
  );

  -- Directora
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'directora@escola-demo.invalid',
    extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'admin'),
    jsonb_build_object('full_name', 'Montse Rovira', 'email', 'directora@escola-demo.invalid', 'email_verified', true, 'sub', v_admin_id::text),
    'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (v_admin_id, v_admin_id, jsonb_build_object('sub', v_admin_id::text, 'email', 'directora@escola-demo.invalid', 'email_verified', true), 'email', v_admin_id::text, now(), now(), now());
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES (v_admin_id, v_school_id, 'admin', 'Montse Rovira', 'directora@escola-demo.invalid', '600 111 222', 'active', true, false);

  -- Educadores (3)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin, created_at, updated_at, phone, confirmation_token, recovery_token, email_change_token_new, email_change, is_anonymous)
  VALUES
    (v_t1_id, '00000000-0000-0000-0000-000000000000', 'laia.roma@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Laia Romà', 'email', 'laia.roma@escola-demo.invalid', 'email_verified', true, 'sub', v_t1_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_t2_id, '00000000-0000-0000-0000-000000000000', 'marc.vidal@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'teacher'), jsonb_build_object('full_name', 'Marc Vidal', 'email', 'marc.vidal@escola-demo.invalid', 'email_verified', true, 'sub', v_t2_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_t3_id, '00000000-0000-0000-0000-000000000000', 'judit.serra@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'auxiliary'), jsonb_build_object('full_name', 'Judit Serra', 'email', 'judit.serra@escola-demo.invalid', 'email_verified', true, 'sub', v_t3_id::text), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false);

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (v_t1_id, v_t1_id, jsonb_build_object('sub', v_t1_id::text, 'email', 'laia.roma@escola-demo.invalid', 'email_verified', true), 'email', v_t1_id::text, now(), now(), now()),
    (v_t2_id, v_t2_id, jsonb_build_object('sub', v_t2_id::text, 'email', 'marc.vidal@escola-demo.invalid', 'email_verified', true), 'email', v_t2_id::text, now(), now(), now()),
    (v_t3_id, v_t3_id, jsonb_build_object('sub', v_t3_id::text, 'email', 'judit.serra@escola-demo.invalid', 'email_verified', true), 'email', v_t3_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES
    (v_t1_id, v_school_id, 'teacher', 'Laia Romà', 'laia.roma@escola-demo.invalid', '', 'active', false, false),
    (v_t2_id, v_school_id, 'teacher', 'Marc Vidal', 'marc.vidal@escola-demo.invalid', '', 'active', false, false),
    (v_t3_id, v_school_id, 'auxiliary', 'Judit Serra', 'judit.serra@escola-demo.invalid', '', 'active', false, false);

  -- Aules (2)
  INSERT INTO public.classrooms (id, school_id, name, level, capacity, teacher_id, auxiliary_teacher_ids, status)
  VALUES
    (v_c_i0_id, v_school_id, 'Brot', 'I0', 12, v_t1_id, ARRAY[v_t3_id], 'active'),
    (v_c_i1_id, v_school_id, 'Flors', 'I1', 14, v_t2_id, ARRAY[v_t3_id], 'active');

  -- Alumnes (10, noms reals ficticis)
  INSERT INTO public.students (id, school_id, first_name, last_name, classroom_id, date_of_birth, status)
  VALUES
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00001', v_school_id, 'Martina', 'Soler', v_c_i0_id, '2024-03-12', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00002', v_school_id, 'Pol', 'García', v_c_i0_id, '2024-01-08', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00003', v_school_id, 'Júlia', 'Martí', v_c_i0_id, '2024-05-22', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00004', v_school_id, 'Arnau', 'Puig', v_c_i0_id, '2024-02-14', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00005', v_school_id, 'Laia', 'Ferrer', v_c_i0_id, '2024-07-03', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00006', v_school_id, 'Nil', 'Torrents', v_c_i1_id, '2023-09-18', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00007', v_school_id, 'Clàudia', 'Roca', v_c_i1_id, '2023-11-02', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00008', v_school_id, 'Jan', 'Mas', v_c_i1_id, '2023-06-25', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00009', v_school_id, 'Aina', 'Pons', v_c_i1_id, '2023-04-30', 'active'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00010', v_school_id, 'Oriol', 'Navarro', v_c_i1_id, '2023-12-11', 'active');

  -- Famílies (correus ficticis)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin, created_at, updated_at, phone, confirmation_token, recovery_token, email_change_token_new, email_change, is_anonymous)
  VALUES
    (v_g1_id, '00000000-0000-0000-0000-000000000000', 'anna.soler@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Anna Soler', 'email_verified', true), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_g2_id, '00000000-0000-0000-0000-000000000000', 'pere.garcia@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Pere García', 'email_verified', true), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_g3_id, '00000000-0000-0000-0000-000000000000', 'montse.marti@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Montse Martí', 'email_verified', true), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false),
    (v_g4_id, '00000000-0000-0000-0000-000000000000', 'joan.torrents@escola-demo.invalid', extensions.crypt(v_pwd, extensions.gen_salt('bf')), now(), jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school_id, 'role', 'guardian'), jsonb_build_object('full_name', 'Joan Torrents', 'email_verified', true), 'authenticated', 'authenticated', false, now(), now(), NULL, '', '', '', '', false);

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (v_g1_id, v_g1_id, jsonb_build_object('sub', v_g1_id::text, 'email', 'anna.soler@escola-demo.invalid', 'email_verified', true), 'email', v_g1_id::text, now(), now(), now()),
    (v_g2_id, v_g2_id, jsonb_build_object('sub', v_g2_id::text, 'email', 'pere.garcia@escola-demo.invalid', 'email_verified', true), 'email', v_g2_id::text, now(), now(), now()),
    (v_g3_id, v_g3_id, jsonb_build_object('sub', v_g3_id::text, 'email', 'montse.marti@escola-demo.invalid', 'email_verified', true), 'email', v_g3_id::text, now(), now(), now()),
    (v_g4_id, v_g4_id, jsonb_build_object('sub', v_g4_id::text, 'email', 'joan.torrents@escola-demo.invalid', 'email_verified', true), 'email', v_g4_id::text, now(), now(), now());

  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset, welcome_email_sent)
  VALUES
    (v_g1_id, v_school_id, 'guardian', 'Anna Soler', 'anna.soler@escola-demo.invalid', '600 333 444', 'active', false, false),
    (v_g2_id, v_school_id, 'guardian', 'Pere García', 'pere.garcia@escola-demo.invalid', '', 'active', false, false),
    (v_g3_id, v_school_id, 'guardian', 'Montse Martí', 'montse.marti@escola-demo.invalid', '', 'active', false, false),
    (v_g4_id, v_school_id, 'guardian', 'Joan Torrents', 'joan.torrents@escola-demo.invalid', '600 555 666', 'active', false, false);

  INSERT INTO public.student_guardians (student_id, guardian_id, relation, is_primary)
  VALUES
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00001', v_g1_id, 'mother', true),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00002', v_g2_id, 'father', true),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00003', v_g3_id, 'mother', true),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00006', v_g4_id, 'father', true);

  -- Notes d'aula (últims dies)
  INSERT INTO public.classroom_daily_notes (school_id, classroom_id, teacher_id, date, note, photo_url)
  VALUES
    (v_school_id, v_c_i0_id, v_t1_id, v_d0, 'Avui hem descobert textures amb sorra i aigua. Molt bona participació!', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80'),
    (v_school_id, v_c_i0_id, v_t1_id, v_d1, 'Taller de pintura amb els dits. Les famílies poden veure les fotos a l''agenda.', NULL),
    (v_school_id, v_c_i1_id, v_t2_id, v_d0, 'Hem cantat cançons de tardor i hem fet un mural col·lectiu.', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'),
    (v_school_id, v_c_i1_id, v_t2_id, v_d1, 'Passeig pel pati observant fulles i colors.', NULL);

  -- Agendes individuals
  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_breakfast, meal_lunch, nap_start, nap_end, notes, photos)
  VALUES
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00001', v_school_id, v_c_i0_id, v_t1_id, v_d1, 'happy', 'all', 'most', '13:00', '14:30', 'Ha compartit joguines amb la Laia. Molt somrient.', ARRAY['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80']),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00002', v_school_id, v_c_i0_id, v_t1_id, v_d1, 'calm', NULL, 'all', '13:15', '14:45', 'Entrada tranquil·la. Ha menjat bé.', '{}'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00003', v_school_id, v_c_i0_id, v_t1_id, v_d1, 'happy', 'most', 'all', NULL, NULL, 'Molta curiositat al racó del soroll.', '{}'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00006', v_school_id, v_c_i1_id, v_t2_id, v_d1, 'happy', 'all', 'all', '13:00', '14:00', 'Ha ajudat a recollir després del pati.', ARRAY['https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=800&q=80']),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00007', v_school_id, v_c_i1_id, v_t2_id, v_d1, 'calm', NULL, 'most', '13:30', '15:00', 'Petit plor a la despedida, després molt bé.', '{}');

  INSERT INTO public.daily_logs (student_id, school_id, classroom_id, teacher_id, date, mood, meal_lunch, notes)
  VALUES
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00001', v_school_id, v_c_i0_id, v_t1_id, v_d0, 'happy', 'all', 'Primer dia de setmana molt positiu.'),
    ('b0b0b0b0-b0b0-40b0-80b0-b0b0b0b00008', v_school_id, v_c_i1_id, v_t2_id, v_d0, 'happy', 'most', 'Ha portat el seu peluix preferit.');

  -- Comunicats
  INSERT INTO public.events_announcements (school_id, author_id, title, description, event_type, audience, event_date, is_pinned)
  VALUES
    (v_school_id, v_admin_id, 'Benvinguda famílies — reunió informativa', 'Us convidem dimecres a les 17:30 a l''aula magna per presentar l''equip i el curs.', 'announcement', 'school', v_d2, true),
    (v_school_id, v_admin_id, 'Recordatori: roba de recanvi', 'Si us plau, porteu una muda etiquetada a l''armari de cada infant.', 'announcement', 'school', v_d1, false);

  RAISE NOTICE 'Centre DEMO creat. Directora: directora@escola-demo.invalid / %', v_pwd;
END $$;
