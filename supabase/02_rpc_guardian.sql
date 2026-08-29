-- Función para crear un usuario tutor (familia) desde el panel de administración
CREATE OR REPLACE FUNCTION create_guardian_user(
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
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 1. Intentar crear el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    phone,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    is_anonymous,
    is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'guardian'),
    jsonb_build_object('full_name', p_full_name, 'email', p_email, 'email_verified', true),
    now(),
    now(),
    NULL,
    '',
    '',
    '',
    '',
    false,
    false
  )
  RETURNING id INTO new_user_id;

  -- 2. Insertar en auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email, 'email_verified', true),
    'email',
    new_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Insertar en public.profiles
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (new_user_id, p_school_id, 'guardian', p_full_name, p_email, p_phone, 'active', true);

  RETURN new_user_id;
END;
$$;
