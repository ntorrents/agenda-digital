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

export const AUDIT_CATEGORY_META: Record<
  AuditCategory,
  { label: string; color: string; actions: AuditAction[] }
> = {
  access: {
    label: 'Accessos (login)',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    actions: ['auth.login'],
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
    actions: ['impersonate.link'],
  },
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'auth.login': 'Login',
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
}

export function getAuditCategory(action: string): AuditCategory {
  for (const [cat, meta] of Object.entries(AUDIT_CATEGORY_META) as [AuditCategory, (typeof AUDIT_CATEGORY_META)[AuditCategory]][]) {
    if (meta.actions.includes(action as AuditAction)) return cat
  }
  return 'system'
}

export function getAuditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] || action
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

type LogAuditParams = {
  actorId: string
  action: AuditAction | string
  entityType: string
  entityId?: string | null
  schoolId?: string | null
  payload?: Record<string, unknown>
}

/** Registra acción en audit_logs (silencioso si la tabla no existe aún). */
export async function logAudit(params: LogAuditParams) {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('audit_logs').insert({
      actor_id: params.actorId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      school_id: params.schoolId ?? null,
      payload: params.payload ?? {},
    })
    if (error && !error.message.includes('does not exist') && error.code !== '42P01') {
      console.error('[audit_logs]', error.message)
    }
  } catch {
    // Tabla pendiente de migración — no bloquear operaciones.
  }
}
