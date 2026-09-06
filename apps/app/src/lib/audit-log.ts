import { createAdminClient } from '@/lib/supabase/admin'

/** Accions registrades a audit_logs */
export type AuditAction =
  // Superadmin / centre
  | 'school.create'
  | 'school.update'
  | 'school.delete'
  | 'classroom.create'
  | 'classroom.update'
  | 'classroom.delete'
  | 'staff.create'
  | 'staff.update'
  | 'staff.archive'
  | 'staff.send_access'
  | 'student.create'
  | 'student.update'
  | 'student.archive'
  | 'import.execute'
  | 'commercial.update'
  | 'document.upload'
  | 'document.delete'
  | 'invoice.create'
  | 'invoice.update'
  | 'invoice.batch'
  | 'impersonate.link'
  // Accessos
  | 'auth.login'
  | 'auth.login_failed'
  // Agendes
  | 'agenda.create'
  | 'agenda.update'
  | 'agenda.bulk_lunch'
  | 'classroom_note.save'
  // Calendari / avisos / missatges
  | 'calendar.event_create'
  | 'calendar.event_delete'
  | 'notice.create'
  | 'notice.delete'
  | 'message.send'
  // Errors operatius
  | 'error.server'
  | 'error.family_agenda'
  | 'error.menu'
  | 'error.school_settings'
  | 'error.push_send'
  | 'error.push_subscribe'
  | 'error.push_unsubscribe'
  | 'push.subscribe'
  | 'push.unsubscribe'
  | 'pwa.install'
  | 'pwa.standalone'
  | 'pwa.browser'

export type AuditSeverity = 'INFO' | 'WARN' | 'ERROR'

export type AuditCategory =
  | 'access'
  | 'agenda'
  | 'calendar'
  | 'communication'
  | 'student'
  | 'staff'
  | 'school'
  | 'commercial'
  | 'system'
  | 'errors'

export const AUDIT_CATEGORY_META: Record<
  AuditCategory,
  { label: string; color: string; actions: AuditAction[] }
> = {
  access: {
    label: 'Accessos (login)',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    actions: ['auth.login', 'auth.login_failed'],
  },
  agenda: {
    label: 'Agendes',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    actions: ['agenda.create', 'agenda.update', 'agenda.bulk_lunch', 'classroom_note.save'],
  },
  calendar: {
    label: 'Calendari',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    actions: ['calendar.event_create', 'calendar.event_delete'],
  },
  communication: {
    label: 'Comunicació',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    actions: ['notice.create', 'notice.delete', 'message.send'],
  },
  student: {
    label: 'Alumnes / famílies',
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    actions: ['student.create', 'student.update', 'student.archive'],
  },
  staff: {
    label: 'Personal',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    actions: ['staff.create', 'staff.update', 'staff.archive', 'staff.send_access'],
  },
  school: {
    label: 'Centre / aules',
    color: 'bg-stone-500/20 text-stone-300 border-stone-500/40',
    actions: [
      'school.create',
      'school.update',
      'school.delete',
      'classroom.create',
      'classroom.update',
      'classroom.delete',
      'import.execute',
    ],
  },
  commercial: {
    label: 'Comercial / ERP',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    actions: [
      'commercial.update',
      'document.upload',
      'document.delete',
      'invoice.create',
      'invoice.update',
      'invoice.batch',
    ],
  },
  system: {
    label: 'Sistema',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    actions: [
      'impersonate.link',
      'push.subscribe',
      'push.unsubscribe',
      'pwa.install',
      'pwa.standalone',
      'pwa.browser',
    ],
  },
  errors: {
    label: 'Errors',
    color: 'bg-red-500/20 text-red-300 border-red-500/40',
    actions: [
      'error.server',
      'error.family_agenda',
      'error.menu',
      'error.school_settings',
      'error.push_send',
      'error.push_subscribe',
      'error.push_unsubscribe',
    ],
  },
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'auth.login': 'Login',
  'auth.login_failed': 'Login fallit',
  'agenda.create': 'Agenda creada',
  'agenda.update': 'Agenda actualitzada',
  'agenda.bulk_lunch': 'Dinar marcat en bloc',
  'classroom_note.save': 'Nota d\'aula',
  'calendar.event_create': 'Esdeveniment creat',
  'calendar.event_delete': 'Esdeveniment eliminat',
  'notice.create': 'Avís publicat',
  'notice.delete': 'Avís eliminat',
  'message.send': 'Missatge enviat',
  'student.create': 'Alumne creat',
  'student.update': 'Alumne actualitzat',
  'student.archive': 'Alumne arxivat',
  'staff.create': 'Personal creat',
  'staff.update': 'Personal actualitzat',
  'staff.archive': 'Personal baixa',
  'staff.send_access': 'Accés enviat',
  'school.create': 'Escola creada',
  'school.update': 'Escola actualitzada',
  'school.delete': 'Escola eliminada',
  'classroom.create': 'Aula creada',
  'classroom.update': 'Aula actualitzada',
  'classroom.delete': 'Aula eliminada',
  'import.execute': 'Importació Excel',
  'commercial.update': 'Dades comercials',
  'document.upload': 'Document pujat',
  'document.delete': 'Document eliminat',
  'invoice.create': 'Factura creada',
  'invoice.update': 'Factura actualitzada',
  'invoice.batch': 'Factures en lot',
  'impersonate.link': 'Impersonació',
  'error.server': 'Error servidor',
  'error.family_agenda': 'Error agenda família',
  'error.menu': 'Error menú',
  'error.school_settings': 'Error settings centre',
  'error.push_send': 'Error enviament push',
  'error.push_subscribe': 'Error subscripció push',
  'error.push_unsubscribe': 'Error baixar push',
  'push.subscribe': 'Push activat',
  'push.unsubscribe': 'Push desactivat',
  'pwa.install': 'PWA instal·lada',
  'pwa.standalone': 'Obre com a app (PWA)',
  'pwa.browser': 'Obre al navegador',
}

export const AUDIT_SEVERITY_META: Record<
  AuditSeverity,
  { label: string; color: string }
> = {
  INFO: { label: 'Info', color: 'bg-stone-500/20 text-stone-300 border-stone-500/40' },
  WARN: { label: 'Avís', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  ERROR: { label: 'Error', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
}

export function getAuditCategory(action: string): AuditCategory {
  for (const [cat, meta] of Object.entries(AUDIT_CATEGORY_META) as [
    AuditCategory,
    (typeof AUDIT_CATEGORY_META)[AuditCategory],
  ][]) {
    if (meta.actions.includes(action as AuditAction)) return cat
  }
  return 'system'
}

export function getAuditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] || action
}

export function normalizeAuditSeverity(value: unknown): AuditSeverity {
  if (value === 'ERROR' || value === 'WARN' || value === 'INFO') return value
  return 'INFO'
}

export function roleLoginLabel(role: string | null | undefined) {
  switch (role) {
    case 'guardian':
      return 'Família'
    case 'teacher':
      return 'Educador/a'
    case 'auxiliary':
      return 'Auxiliar'
    case 'admin':
      return 'Direcció'
    case 'superadmin':
      return 'Superadmin'
    default:
      return role || 'Usuari'
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

type LogAuditParams = {
  actorId?: string | null
  action: AuditAction | string
  entityType: string
  entityId?: string | null
  schoolId?: string | null
  payload?: Record<string, unknown>
  severity?: AuditSeverity
}

/** Registra acción en audit_logs (silencioso si la tabla no existe aún). */
export async function logAudit(params: LogAuditParams) {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('audit_logs').insert({
      actor_id: params.actorId ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      school_id: params.schoolId ?? null,
      payload: params.payload ?? {},
      severity: params.severity ?? 'INFO',
    })
    if (error && !error.message.includes('does not exist') && error.code !== '42P01') {
      console.error('[audit_logs]', error.message)
    }
  } catch {
    // Tabla pendiente de migración — no bloquear operaciones.
  }
}

/**
 * Helper per blocs catch: registra ERROR sense llançar.
 * Ús: `await logAuditError({ action: 'error.menu', error: e, actorId, schoolId })`
 */
export async function logAuditError(params: {
  error: unknown
  action?: AuditAction | string
  entityType?: string
  entityId?: string | null
  actorId?: string | null
  schoolId?: string | null
  context?: Record<string, unknown>
}) {
  const message = errorMessage(params.error)
  const stack =
    params.error instanceof Error ? params.error.stack?.slice(0, 2000) : undefined

  await logAudit({
    actorId: params.actorId ?? null,
    action: params.action || 'error.server',
    entityType: params.entityType || 'error',
    entityId: params.entityId ?? null,
    schoolId: params.schoolId ?? null,
    severity: 'ERROR',
    payload: {
      message,
      ...(stack ? { stack } : {}),
      ...params.context,
    },
  })
}
