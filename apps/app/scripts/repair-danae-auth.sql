-- Reparar SOLO Danae Ruiz (Auth ya existe; identity/password rotos)
-- Contraseña temporal tras ejecutar: TempLumen2026!

DO $$
DECLARE
  v_id UUID := 'a155af83-6f22-42f9-82f0-e4587a455572';
  v_email TEXT := 'danaeruiz@escolalumen.net';
  v_pwd TEXT := 'TempLumen2026!';
BEGIN
  -- 1) Limpiar tokens / email_change que rompen l'Admin API
  UPDATE auth.users
  SET
    encrypted_password = extensions.crypt(v_pwd, extensions.gen_salt('bf')),
    email = lower(v_email),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    email_change = '',
    email_change_token_new = '',
    confirmation_token = '',
    recovery_token = '',
    updated_at = now()
  WHERE id = v_id;

  -- 2) Reparar identity_data (GoTrue necessita email aquí)
  UPDATE auth.identities
  SET
    identity_data = jsonb_build_object(
      'sub', v_id::text,
      'email', lower(v_email),
      'email_verified', true
    ),
    provider_id = lower(v_email),
    updated_at = now()
  WHERE user_id = v_id
    AND provider = 'email';

  -- Si no hi havia identity (per si de cas)
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  SELECT
    v_id, v_id,
    jsonb_build_object('sub', v_id::text, 'email', lower(v_email), 'email_verified', true),
    'email', lower(v_email), now(), now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_id AND provider = 'email'
  );

  UPDATE public.profiles
  SET
    email = lower(v_email),
    force_password_reset = true,
    welcome_email_sent = false
  WHERE id = v_id;

  RAISE NOTICE 'Danae reparada. Pwd temporal: % — després pots tornar a «Enviar acceso»', v_pwd;
END $$;

-- Verificació
SELECT
  u.id,
  u.email AS auth_email,
  u.email_change,
  i.provider_id,
  i.identity_data
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id AND i.provider = 'email'
WHERE u.id = 'a155af83-6f22-42f9-82f0-e4587a455572';
