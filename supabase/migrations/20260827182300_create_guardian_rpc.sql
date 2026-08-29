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
  -- Si el email ya existe en auth.users pero en otro centro, esto fallará.
  -- Para una demo/MVP básica, crearemos el usuario usando funciones internas de supabase.
  
  -- Insert into auth.users (simplificado, usar con precaución)
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
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'guardian'),
    jsonb_build_object('full_name', p_full_name),
    now(),
    now()
  )
  RETURNING id INTO new_user_id;

  -- 2. Insertar en public.profiles
  INSERT INTO public.profiles (id, school_id, role, full_name, email, phone, status, force_password_reset)
  VALUES (new_user_id, p_school_id, 'guardian', p_full_name, p_email, p_phone, 'active', true);

  RETURN new_user_id;
END;
$$;
