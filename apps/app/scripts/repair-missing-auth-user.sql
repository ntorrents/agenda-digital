-- ==============================================================================
-- Diagnóstico + reparación: profile sin Auth (causa "Database error checking email")
-- Sustituye el email si hace falta.
-- ==============================================================================

-- 1) Auth vs Profile (ejecutar y mirar las DOS tablas de resultados / o por separado)
SELECT 'auth' AS origen, id::text, email, created_at::text
FROM auth.users
WHERE lower(email) = lower('danaeruiz@escolalumen.net')
UNION ALL
SELECT 'profile', id::text, email, NULL
FROM public.profiles
WHERE lower(email) = lower('danaeruiz@escolalumen.net');

-- 2) ¿Hay trigger en auth.users que crea profiles?
SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND NOT tgisinternal;

-- 3) Si el profile existe y Auth NO → crear Auth a mano (evita el trigger roto)
-- Contraseña temporal: TempLumen2026!  (cámbiala después con "Enviar acceso" o login)
DO $$
DECLARE
  v_id UUID;
  v_email TEXT := 'danaeruiz@escolalumen.net';
  v_name TEXT;
  v_role TEXT;
  v_school UUID;
  v_pwd TEXT := 'TempLumen2026!';
BEGIN
  SELECT id, full_name, role, school_id
    INTO v_id, v_name, v_role, v_school
  FROM public.profiles
  WHERE lower(email) = lower(v_email);

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'No hi ha profile per %', v_email;
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_id) THEN
    RAISE NOTICE 'Ja existeix auth.users per % (%)', v_email, v_id;
    RETURN;
  END IF;

  -- Si hi ha un Auth orfe amb el mateix email i altre id, esborra'l
  DELETE FROM auth.identities
  WHERE user_id IN (SELECT id FROM auth.users WHERE lower(email) = lower(v_email) AND id <> v_id);
  DELETE FROM auth.users
  WHERE lower(email) = lower(v_email) AND id <> v_id;

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at, phone, confirmation_token, recovery_token,
    email_change_token_new, email_change, is_anonymous
  ) VALUES (
    v_id,
    '00000000-0000-0000-0000-000000000000',
    lower(v_email),
    extensions.crypt(v_pwd, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'school_id', v_school, 'role', v_role),
    jsonb_build_object('full_name', COALESCE(v_name, ''), 'email', lower(v_email), 'email_verified', true, 'sub', v_id::text),
    'authenticated', 'authenticated', false,
    now(), now(), NULL, '', '', '', '', false
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_id, v_id,
    jsonb_build_object('sub', v_id::text, 'email', lower(v_email), 'email_verified', true),
    'email', v_id::text, now(), now(), now()
  );

  UPDATE public.profiles
  SET force_password_reset = true, welcome_email_sent = false
  WHERE id = v_id;

  RAISE NOTICE 'Auth creat per % / id=% / pwd temporal=%', v_email, v_id, v_pwd;
END $$;
