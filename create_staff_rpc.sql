-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.create_staff_user(text, text, text, text);

-- Create a secure RPC to create staff members (admin only)
CREATE OR REPLACE FUNCTION public.create_staff_user(
  p_email text,
  p_full_name text,
  p_role text, -- 'admin' or 'teacher'
  p_password text
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_school_id UUID;
  v_admin_role TEXT;
BEGIN
  -- Verify caller is an admin
  SELECT school_id INTO v_school_id FROM public.profiles WHERE id = auth.uid();
  SELECT role::text INTO v_admin_role FROM public.profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' OR v_school_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can create staff users';
  END IF;

  IF p_role NOT IN ('admin', 'teacher') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin or teacher';
  END IF;

  -- Generate new UUID for the user
  v_user_id := extensions.uuid_generate_v4();

  -- 1. Insert into auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, is_super_admin,
    created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated',
    false,
    now(),
    now()
  );

  -- 2. Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Insert into public.profiles
  INSERT INTO public.profiles (id, school_id, role, full_name, email, is_active)
  VALUES (v_user_id, v_school_id, p_role::user_role, p_full_name, p_email, true);

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;
