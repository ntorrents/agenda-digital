-- Fotos grupales: varias por aula/día (photo_urls text[])
-- Ejecutar en PRE (Studio local / localhost:8000) y después en PRO (Dashboard → SQL Editor).
-- Idempotente: no falla si la columna ya existe o el backfill ya se aplicó.

ALTER TABLE public.classroom_daily_notes
  ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.classroom_daily_notes.photo_urls IS
  'URLs de fotos grupales del aula para esa fecha (varias). photo_url se mantiene sincronizada como la primera por compatibilidad.';

-- Backfill desde photo_url legacy
UPDATE public.classroom_daily_notes
SET photo_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL
  AND photo_url <> ''
  AND (photo_urls IS NULL OR photo_urls = '{}'::text[]);

-- Sincronizar photo_url con la primera de photo_urls cuando falte
UPDATE public.classroom_daily_notes
SET photo_url = photo_urls[1]
WHERE (photo_url IS NULL OR photo_url = '')
  AND photo_urls IS NOT NULL
  AND cardinality(photo_urls) > 0;
