-- Ejecutar en Supabase SQL Editor (solo superadmin ve estos logs en la app).
-- Inclou severitat (INFO / WARN / ERROR) per monitoratge proactiu.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'INFO'
    CHECK (severity IN ('INFO', 'WARN', 'ERROR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Si la taula ja existia sense severity:
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'INFO';

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_severity_check;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_severity_check
  CHECK (severity IN ('INFO', 'WARN', 'ERROR'));

CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_idx ON public.audit_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_severity_created_idx ON public.audit_logs (severity, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo service role / superadmin vía admin client escribe y lee desde la app.
DROP POLICY IF EXISTS "audit_logs_service_only" ON public.audit_logs;
CREATE POLICY "audit_logs_service_only"
  ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
