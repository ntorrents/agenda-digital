-- Agenda: asegurar columna merienda (meal_snack)
-- Ejecutar en PRE (Studio local / localhost:8000) y después en PRO (Dashboard → SQL Editor).
-- Idempotente: no falla si la columna ya existe.

ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS meal_snack public.meal_amount;

COMMENT ON COLUMN public.daily_logs.meal_snack IS
  'Cantidad de merienda (all/most/little/none), mismo formato que desayuno.';
