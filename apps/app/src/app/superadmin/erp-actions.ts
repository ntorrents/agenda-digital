'use server'

import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit-log'
import { normalizeEmail } from '@/lib/auth-email'
import { getImpersonationAppUrl } from '@/lib/email'
import {
  getCommercialFromSettings,
  mergeCommercialSettings,
  type CommercialSettings,
} from '@/lib/superadmin-commercial'
import { requireSuperadmin } from '@/lib/superadmin-auth'
import { DOCUMENTS_BUCKET } from '@/lib/storage'

function revalidateErp(schoolId?: string) {
  revalidatePath('/superadmin/finances')
  revalidatePath('/superadmin/alertes')
  revalidatePath('/superadmin/usuaris')
  revalidatePath('/superadmin')
  if (schoolId) revalidatePath(`/superadmin/escoles/${schoolId}`)
}

export async function updateSchoolCommercial(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const patch: CommercialSettings = {
    contract_start: (formData.get('contract_start') as string) || null,
    contract_end: (formData.get('contract_end') as string) || null,
    renewal_date: (formData.get('renewal_date') as string) || null,
    trial_end: (formData.get('trial_end') as string) || null,
    billing_cycle: (formData.get('billing_cycle') as CommercialSettings['billing_cycle']) || 'monthly',
    payment_terms_days: parseInt((formData.get('payment_terms_days') as string) || '30', 10) || 30,
    billing_email: normalizeEmail((formData.get('billing_email') as string) || '') || null,
    commercial_contact_name: (formData.get('commercial_contact_name') as string)?.trim() || null,
    commercial_contact_email: normalizeEmail((formData.get('commercial_contact_email') as string) || '') || null,
    commercial_contact_phone: (formData.get('commercial_contact_phone') as string)?.trim() || null,
    legal_entity_name: (formData.get('legal_entity_name') as string)?.trim() || null,
    billing_address: (formData.get('billing_address') as string)?.trim() || null,
    vat_included: formData.get('vat_included') === 'on',
    iban_or_payment_notes: (formData.get('iban_or_payment_notes') as string)?.trim() || null,
    internal_notes: (formData.get('internal_notes') as string)?.trim() || null,
    next_review_date: (formData.get('next_review_date') as string) || null,
  }

  const { data: current } = await admin.from('schools').select('settings').eq('id', schoolId).single()
  const settings = mergeCommercialSettings(current?.settings, patch)

  const { error } = await admin.from('schools').update({ settings }).eq('id', schoolId)
  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'commercial.update',
    entityType: 'school',
    entityId: schoolId,
    schoolId,
  })

  revalidateErp(schoolId)
  return { success: true }
}

export async function uploadSchoolDocument(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const docType = (formData.get('doc_type') as string) || 'other'
  const title = (formData.get('title') as string)?.trim()
  const signedAt = (formData.get('signed_at') as string) || null
  const expiresAt = (formData.get('expires_at') as string) || null
  const notes = (formData.get('notes') as string)?.trim() || null
  const file = formData.get('file') as File | null

  if (!title || !file?.size) return { error: 'Títol i arxiu obligatoris' }

  const ext = file.name.split('.').pop() || 'pdf'
  const fileName = `${schoolId}/commercial/${docType}/${Date.now()}.${ext}`

  const { error: uploadError } = await admin.storage.from(DOCUMENTS_BUCKET).upload(fileName, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = admin.storage.from(DOCUMENTS_BUCKET).getPublicUrl(fileName)

  const { error } = await admin.from('school_documents').insert({
    school_id: schoolId,
    doc_type: docType,
    title,
    file_url: urlData.publicUrl,
    file_name: file.name,
    signed_at: signedAt || null,
    expires_at: expiresAt || null,
    notes,
    uploaded_by: actorId,
  })

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'document.upload',
    entityType: 'school_document',
    schoolId,
    payload: { docType, title },
  })

  revalidateErp(schoolId)
  return { success: true }
}

export async function deleteSchoolDocument(schoolId: string, documentId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { error } = await admin
    .from('school_documents')
    .delete()
    .eq('id', documentId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'document.delete',
    entityType: 'school_document',
    entityId: documentId,
    schoolId,
  })

  revalidateErp(schoolId)
  return { success: true }
}

export async function createSchoolInvoice(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const periodStart = formData.get('period_start') as string
  const periodEnd = formData.get('period_end') as string
  const amount = parseFloat((formData.get('amount') as string) || '0')
  const status = (formData.get('status') as string) || 'pending'
  const dueDate = (formData.get('due_date') as string) || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!periodStart || !periodEnd || !amount) return { error: 'Període i import obligatoris' }

  const { data, error } = await admin
    .from('school_invoices')
    .insert({
      school_id: schoolId,
      period_start: periodStart,
      period_end: periodEnd,
      amount,
      status,
      due_date: dueDate,
      reference,
      notes,
      created_by: actorId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'invoice.create',
    entityType: 'school_invoice',
    entityId: data.id,
    schoolId,
    payload: { amount, status },
  })

  revalidateErp(schoolId)
  return { success: true }
}

export async function updateSchoolInvoice(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const paidAtRaw = formData.get('paid_at') as string
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!id) return { error: 'ID obligatori' }

  const update: Record<string, unknown> = {
    status,
    notes,
    updated_at: new Date().toISOString(),
  }
  if (status === 'paid') {
    update.paid_at = paidAtRaw ? new Date(paidAtRaw).toISOString() : new Date().toISOString()
  }

  const { error } = await admin
    .from('school_invoices')
    .update(update)
    .eq('id', id)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'invoice.update',
    entityType: 'school_invoice',
    entityId: id,
    schoolId,
    payload: { status },
  })

  revalidateErp(schoolId)
  return { success: true }
}

export async function logBillingPriceChange(
  admin: Awaited<ReturnType<typeof requireSuperadmin>>['admin'],
  schoolId: string,
  monthlyPrice: number,
  actorId: string,
  reason?: string
) {
  try {
    await admin.from('school_billing_events').insert({
      school_id: schoolId,
      monthly_price: monthlyPrice,
      effective_from: new Date().toISOString().slice(0, 10),
      reason: reason || 'Actualització des del panell',
      actor_id: actorId,
    })
  } catch {
    // tabla opcional
  }
}

export async function searchGlobalUsers(query: string) {
  const { admin } = await requireSuperadmin()

  const q = query.trim()
  if (q.length < 2) return { users: [] as GlobalUserRow[] }

  const { data, error } = await admin
    .from('profiles')
    .select('id, full_name, email, role, school_id, status, welcome_email_sent')
    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .neq('role', 'superadmin')
    .limit(50)

  if (error) return { error: error.message, users: [] }

  const schoolIds = [...new Set((data || []).map((p) => p.school_id).filter(Boolean))] as string[]
  const schoolById = new Map<string, { name: string; slug: string }>()
  if (schoolIds.length) {
    const { data: schools } = await admin.from('schools').select('id, name, slug').in('id', schoolIds)
    for (const s of schools || []) schoolById.set(s.id, { name: s.name, slug: s.slug })
  }

  return {
    users: (data || []).map((p) => {
      const school = p.school_id ? schoolById.get(p.school_id) : null
      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        school_id: p.school_id,
        school_name: school?.name || null,
        school_slug: school?.slug || null,
        status: p.status,
        welcome_email_sent: !!p.welcome_email_sent,
      }
    }),
  }
}

export type GlobalUserRow = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  school_id: string | null
  school_name: string | null
  school_slug: string | null
  status: string
  welcome_email_sent: boolean
}

export async function getImpersonationLink(userId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('email, role, school_id, full_name')
    .eq('id', userId)
    .single()

  if (profileError || !profile?.email) return { error: 'Usuari no trobat o sense correu' }
  if (profile.role === 'superadmin') return { error: 'No es pot impersonar un superadmin' }

  const appBase = getImpersonationAppUrl()
  const nextPath = profile.role === 'guardian' ? '/mi-hijo' : '/dashboard'
  const redirectTo = `${appBase}/auth/callback?next=${encodeURIComponent(nextPath)}`

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
    options: { redirectTo },
  })

  if (error || !data?.properties?.action_link) {
    return { error: error?.message || 'No s\'ha pogut generar l\'enllaç' }
  }

  await logAudit({
    actorId,
    action: 'impersonate.link',
    entityType: 'profile',
    entityId: userId,
    schoolId: profile.school_id,
    payload: { email: profile.email, role: profile.role },
  })

  return {
    success: true,
    url: data.properties.action_link,
    email: profile.email,
    fullName: profile.full_name,
  }
}

export async function exportFinancesCsv() {
  const { admin } = await requireSuperadmin()

  const { data: schools } = await admin.from('schools').select('id, name, slug, settings, cif, created_at').order('name')

  const rows: string[][] = [
    [
      'Escola',
      'Slug',
      'CIF',
      'Activa',
      'Quota mensual €',
      'Inici contracte',
      'Fi contracte',
      'Renovació',
      'Termini pagament (dies)',
      'Email facturació',
      'Contacte comercial',
      'Alumnes actius',
      'Notes internes',
    ],
  ]

  for (const school of schools || []) {
    const commercial = getCommercialFromSettings(school.settings)
    const { count: students } = await admin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .eq('status', 'active')

    const settings = school.settings as { ops?: { active?: boolean }; billing?: { monthly_price?: number } }
    const active = settings?.ops?.active !== false
    const monthly =
      typeof settings?.billing?.monthly_price === 'number' ? settings.billing.monthly_price : 80

    rows.push([
      school.name,
      school.slug,
      school.cif || '',
      active ? 'Sí' : 'No',
      String(monthly),
      commercial.contract_start || '',
      commercial.contract_end || '',
      commercial.renewal_date || '',
      String(commercial.payment_terms_days ?? 30),
      commercial.billing_email || '',
      commercial.commercial_contact_name || '',
      String(students || 0),
      (commercial.internal_notes || '').replace(/\n/g, ' '),
    ])
  }

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return { csv, filename: `petit-diari-finances-${new Date().toISOString().slice(0, 10)}.csv` }
}

export async function generateMonthlyInvoicesDraft(month: string) {
  /** month = YYYY-MM — crea factures pending per centres actius */
  const { admin, actorId } = await requireSuperadmin()

  const [year, mon] = month.split('-').map(Number)
  if (!year || !mon) return { error: 'Format YYYY-MM' }

  const periodStart = `${year}-${String(mon).padStart(2, '0')}-01`
  const lastDay = new Date(year, mon, 0).getDate()
  const periodEnd = `${year}-${String(mon).padStart(2, '0')}-${lastDay}`

  const { data: schools } = await admin.from('schools').select('id, name, settings')

  let created = 0
  for (const school of schools || []) {
    const settings = school.settings as {
      ops?: { active?: boolean }
      billing?: { monthly_price?: number }
      commercial?: { payment_terms_days?: number }
    }
    if (settings?.ops?.active === false) continue

    const amount = settings?.billing?.monthly_price ?? 80
    const terms = settings?.commercial?.payment_terms_days ?? 30
    const due = new Date(year, mon - 1, 1)
    due.setDate(due.getDate() + terms)
    const dueDate = due.toISOString().slice(0, 10)

    const { data: existing } = await admin
      .from('school_invoices')
      .select('id')
      .eq('school_id', school.id)
      .eq('period_start', periodStart)
      .maybeSingle()

    if (existing) continue

    const { error } = await admin.from('school_invoices').insert({
      school_id: school.id,
      period_start: periodStart,
      period_end: periodEnd,
      amount,
      status: 'pending',
      due_date: dueDate,
      reference: `PD-${year}${String(mon).padStart(2, '0')}-${school.id.slice(0, 6)}`,
      created_by: actorId,
    })

    if (!error) created++
  }

  await logAudit({
    actorId,
    action: 'invoice.batch',
    entityType: 'school_invoice',
    payload: { month, created },
  })

  revalidateErp()
  return { success: true, created }
}
