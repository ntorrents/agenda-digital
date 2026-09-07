-- Agenda: platos de comida + estado borrador/publicada
-- Ejecutar en PRE (Studio local) y después en PRO (Dashboard → SQL Editor).

-- 1) Platos (además de meal_breakfast)
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS meal_first_course public.meal_amount,
  ADD COLUMN IF NOT EXISTS meal_second_course public.meal_amount,
  ADD COLUMN IF NOT EXISTS meal_dessert public.meal_amount;

-- Migrar "comida" antigua → 1.er plato
UPDATE public.daily_logs
SET meal_first_course = meal_lunch
WHERE meal_first_course IS NULL
  AND meal_lunch IS NOT NULL;

-- 2) Estado: filas existentes = published; nuevas = draft
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.daily_logs
SET status = 'published'
WHERE status IS NULL;

ALTER TABLE public.daily_logs
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.daily_logs
  DROP CONSTRAINT IF EXISTS daily_logs_status_check;

ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_status_check
  CHECK (status IN ('draft', 'published'));

ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE public.daily_logs
SET published_at = COALESCE(updated_at, created_at, now())
WHERE status = 'published'
  AND published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_daily_logs_classroom_date_status
  ON public.daily_logs (classroom_id, date, status);

-- 3) Familias solo ven agendas enviadas (published)
DROP POLICY IF EXISTS "daily_logs_select_guardian" ON public.daily_logs;

CREATE POLICY "daily_logs_select_guardian"
  ON public.daily_logs
  FOR SELECT
  TO authenticated
  USING (
    (school_id = public.auth_school_id())
    AND (public.auth_role() = 'guardian'::text)
    AND (student_id IN (
      SELECT student_guardians.student_id
      FROM public.student_guardians
      WHERE student_guardians.guardian_id = auth.uid()
    ))
    AND (status = 'published')
  );
