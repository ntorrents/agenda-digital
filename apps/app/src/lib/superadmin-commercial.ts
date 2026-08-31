/** Datos comerciales almacenados en schools.settings.commercial */

export type CommercialSettings = {
  contract_start?: string | null
  contract_end?: string | null
  renewal_date?: string | null
  trial_end?: string | null
  billing_cycle?: 'monthly' | 'quarterly' | 'annual'
  payment_terms_days?: number
  billing_email?: string | null
  commercial_contact_name?: string | null
  commercial_contact_email?: string | null
  commercial_contact_phone?: string | null
  legal_entity_name?: string | null
  billing_address?: string | null
  vat_included?: boolean
  iban_or_payment_notes?: string | null
  internal_notes?: string | null
  next_review_date?: string | null
}

export type SchoolDocument = {
  id: string
  school_id: string
  doc_type: string
  title: string
  file_url: string
  file_name: string | null
  signed_at: string | null
  expires_at: string | null
  notes: string | null
  created_at: string
}

export type SchoolInvoice = {
  id: string
  school_id: string
  period_start: string
  period_end: string
  amount: number
  status: string
  due_date: string | null
  paid_at: string | null
  reference: string | null
  notes: string | null
  created_at: string
}

export type BillingEvent = {
  id: string
  school_id: string
  monthly_price: number
  effective_from: string
  reason: string | null
  created_at: string
}

export function getCommercialFromSettings(settings: unknown): CommercialSettings {
  const s = settings as { commercial?: CommercialSettings } | null
  return s?.commercial || {}
}

export function mergeCommercialSettings(
  current: unknown,
  patch: CommercialSettings
): Record<string, unknown> {
  const base =
    typeof current === 'object' && current && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {}
  const prev = getCommercialFromSettings(current)
  return {
    ...base,
    commercial: { ...prev, ...patch },
  }
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  contract: 'Contracte signat',
  nda: 'NDA / confidencialitat',
  amendment: 'Addenda / modificació',
  proposal: 'Proposta comercial',
  invoice_scan: 'Factura escanejada',
  other: 'Altre',
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Esborrany',
  pending: 'Pendent',
  sent: 'Enviada',
  paid: 'Pagada',
  overdue: 'Vençuda',
  cancelled: 'Anul·lada',
}

export function isErpTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false
  return (
    error.code === '42P01' ||
    !!error.message?.includes('does not exist') ||
    !!error.message?.includes('school_documents') ||
    !!error.message?.includes('school_invoices') ||
    !!error.message?.includes('school_billing_events')
  )
}
