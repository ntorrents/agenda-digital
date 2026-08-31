-- ERP superadmin: ejecutar en Supabase SQL Editor (junto con audit-logs.sql si falta).

-- Documentos comerciales (contrato, NDA, anexos...)
CREATE TABLE IF NOT EXISTS public.school_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('contract', 'nda', 'amendment', 'proposal', 'invoice_scan', 'other')),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  signed_at DATE,
  expires_at DATE,
  notes TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS school_documents_school_id_idx ON public.school_documents (school_id);

-- Facturas / cobros previstos
CREATE TABLE IF NOT EXISTS public.school_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS school_invoices_school_id_idx ON public.school_invoices (school_id);
CREATE INDEX IF NOT EXISTS school_invoices_status_idx ON public.school_invoices (status);
CREATE INDEX IF NOT EXISTS school_invoices_due_date_idx ON public.school_invoices (due_date);

-- Historial de cambios de tarifa
CREATE TABLE IF NOT EXISTS public.school_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  monthly_price NUMERIC(12, 2) NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS school_billing_events_school_id_idx ON public.school_billing_events (school_id);

ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_billing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_documents_service" ON public.school_documents;
CREATE POLICY "school_documents_service" ON public.school_documents FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "school_invoices_service" ON public.school_invoices;
CREATE POLICY "school_invoices_service" ON public.school_invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "school_billing_events_service" ON public.school_billing_events;
CREATE POLICY "school_billing_events_service" ON public.school_billing_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Bucket para docs comerciales (usa school-documents/{school_id}/commercial/...)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-documents', 'school-documents', true, 20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit;
