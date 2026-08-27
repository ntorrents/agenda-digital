-- Fix RLS functions to use profiles table with SECURITY DEFINER to avoid infinite recursion
-- and to not rely on app_metadata which gets wiped by Gotrue on login.

CREATE OR REPLACE FUNCTION auth_school_id()
RETURNS UUID AS $$
DECLARE
  v_school_id UUID;
BEGIN
  SELECT school_id INTO v_school_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
