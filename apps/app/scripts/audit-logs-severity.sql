-- Fase 2.4: severitat a audit_logs (PRE + PRO)
-- Executar després de audit-logs.sql si la taula ja existeix.

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'INFO';

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_severity_check;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_severity_check
  CHECK (severity IN ('INFO', 'WARN', 'ERROR'));

CREATE INDEX IF NOT EXISTS audit_logs_severity_created_idx
  ON public.audit_logs (severity, created_at DESC);

COMMENT ON COLUMN public.audit_logs.severity IS 'INFO | WARN | ERROR — errors operatius per monitoratge proactiu';
