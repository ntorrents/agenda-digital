-- RPC per reset de contrasenya quan l'Admin API falla amb "Database error checking email"
-- Executar UN COP al SQL Editor de Supabase.

CREATE OR REPLACE FUNCTION public.admin_set_user_password(p_user_id uuid, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text;
BEGIN
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password massa curt';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuari Auth no trobat: %', p_user_id;
  END IF;

  UPDATE auth.users
  SET
    encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    email_change = '',
    email_change_token_new = '',
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    updated_at = now()
  WHERE id = p_user_id;

  UPDATE auth.identities
  SET
    identity_data = COALESCE(identity_data, '{}'::jsonb) || jsonb_build_object(
      'sub', p_user_id::text,
      'email', lower(v_email),
      'email_verified', true
    ),
    provider_id = CASE
      WHEN provider_id ~* '^[0-9a-f-]{36}$' THEN lower(v_email)
      ELSE provider_id
    END,
    updated_at = now()
  WHERE user_id = p_user_id
    AND provider = 'email';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_password(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_password(uuid, text) TO service_role;
