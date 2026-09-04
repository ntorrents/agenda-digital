-- ==============================================================================
-- Petit Diari — LIMPIEZA: elimina todo EXCEPTO el centro DEMO y el superadmin
--
-- Preserva:
--   ✅ Escuela DEMO (a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0) con todos sus datos
--   ✅ Tu usuario superadmin (profiles.role = 'superadmin')
--   ✅ Tablas de estructura (school_documents, school_invoices, etc.) — solo borra filas
--   ✅ Storage buckets (no se tocan)
--   ✅ Extensiones, funciones, RLS policies
--
-- ⚠️  EJECUTAR EN EL SQL EDITOR DE SUPABASE — ES DESTRUCTIVO E IRREVERSIBLE
-- ==============================================================================

DO $$
DECLARE
  v_demo_school_id UUID := 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0';
  v_deleted_schools INT;
  v_deleted_users INT;
BEGIN

  -- 1. Datos dependientes de escuelas NO-demo
  DELETE FROM public.events_announcements   WHERE school_id != v_demo_school_id;
  DELETE FROM public.classroom_daily_notes  WHERE school_id != v_demo_school_id;
  DELETE FROM public.daily_logs             WHERE school_id != v_demo_school_id;
  DELETE FROM public.messages               WHERE school_id != v_demo_school_id;

  -- 2. Student guardians de alumnos no-demo
  DELETE FROM public.student_guardians
    WHERE student_id IN (
      SELECT id FROM public.students WHERE school_id != v_demo_school_id
    );

  -- 3. Alumnos, aulas
  DELETE FROM public.students   WHERE school_id != v_demo_school_id;
  DELETE FROM public.classrooms WHERE school_id != v_demo_school_id;

  -- 4. Menús comedor
  DELETE FROM public.dining_menus WHERE school_id != v_demo_school_id;

  -- 5. ERP (si existen las tablas)
  DELETE FROM public.school_billing_events WHERE school_id != v_demo_school_id;
  DELETE FROM public.school_invoices       WHERE school_id != v_demo_school_id;
  DELETE FROM public.school_documents      WHERE school_id != v_demo_school_id;

  -- 6. Audit logs de escuelas no-demo (si existe la tabla)
  DELETE FROM public.audit_logs WHERE school_id IS NOT NULL AND school_id != v_demo_school_id;

  -- 7. Profiles no-demo y no-superadmin
  DELETE FROM public.profiles
    WHERE school_id != v_demo_school_id
      AND role != 'superadmin';

  -- 8. Auth: identities y users de cuentas que ya no tienen profile (excepto superadmin)
  --    Recogemos los IDs de auth.users que NO son superadmin y NO son del demo
  DELETE FROM auth.identities
    WHERE user_id IN (
      SELECT u.id FROM auth.users u
       WHERE u.id NOT IN (SELECT p.id FROM public.profiles p)
    );

  DELETE FROM auth.users
    WHERE id NOT IN (SELECT p.id FROM public.profiles p);

  GET DIAGNOSTICS v_deleted_users = ROW_COUNT;

  -- 9. Escuelas no-demo
  DELETE FROM public.schools WHERE id != v_demo_school_id;
  GET DIAGNOSTICS v_deleted_schools = ROW_COUNT;

  RAISE NOTICE '✅ Limpieza completada: % escuelas eliminadas, % usuarios auth eliminados.',
    v_deleted_schools, v_deleted_users;
  RAISE NOTICE '   Preservados: centro DEMO (%) + superadmin.',
    v_demo_school_id;

END $$;
