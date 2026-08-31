import { createAdminClient } from '@/lib/supabase/admin'

export type AuditAction =
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

type LogAuditParams = {
  actorId: string
  action: AuditAction
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
