'use server'

import { createClient } from '@/lib/supabase/server'
import { type AuditAction, logAudit, logAuditError } from '@/lib/audit-log'

/** Registre d'auditoria des del client (després d'una acció exitosa). */
export async function recordClientAudit(input: {
  action: AuditAction
  entityType: string
  entityId?: string | null
  payload?: Record<string, unknown>
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role, email, full_name')
      .eq('id', user.id)
      .maybeSingle()

    await logAudit({
      actorId: user.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      schoolId: profile?.school_id ?? null,
      severity: 'INFO',
      payload: {
        ...input.payload,
        actorRole: profile?.role,
        actorEmail: profile?.email,
      },
    })

    return { success: true }
  } catch (e) {
    console.error('[recordClientAudit]', e)
    return { error: 'audit_failed' }
  }
}

/** Login exitós (cridat des de /login). */
export async function recordLoginAudit() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role, email, full_name')
      .eq('id', user.id)
      .maybeSingle()

    await logAudit({
      actorId: user.id,
      action: 'auth.login',
      entityType: 'session',
      entityId: user.id,
      schoolId: profile?.school_id ?? null,
      severity: 'INFO',
      payload: {
        role: profile?.role || user.app_metadata?.role || null,
        email: profile?.email || user.email || null,
        fullName: profile?.full_name || null,
      },
    })

    return { success: true }
  } catch (e) {
    console.error('[recordLoginAudit]', e)
    return { error: 'audit_failed' }
  }
}

/**
 * Registra un error des del client o d'un catch (no bloqueja).
 * Accepta usuaris anònims (p.ex. login fallit).
 */
export async function recordAuditError(input: {
  action?: AuditAction | string
  entityType?: string
  message: string
  context?: Record<string, unknown>
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let schoolId: string | null = null
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .maybeSingle()
      schoolId = profile?.school_id ?? null
    }

    await logAuditError({
      error: new Error(input.message),
      action: input.action || 'error.server',
      entityType: input.entityType || 'error',
      actorId: user?.id ?? null,
      schoolId,
      context: input.context,
    })

    return { success: true }
  } catch (e) {
    console.error('[recordAuditError]', e)
    return { error: 'audit_failed' }
  }
}
