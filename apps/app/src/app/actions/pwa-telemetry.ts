'use server'

import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit-log'
import type { AuditAction } from '@/lib/audit-log'

export type PwaClientReport = {
  mode: 'standalone' | 'browser'
  /** true quan l'usuari accepta el prompt natiu d'instal·lació (Android) */
  installed?: boolean
  platform?: string
}

/**
 * Telemetria PWA → audit_logs.
 * El client ho crida un cop per sessió (mode) i quan s'accepta la instal·lació.
 */
export async function reportPwaClient(input: PwaClientReport) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false as const }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    let action: AuditAction
    if (input.installed) {
      action = 'pwa.install'
    } else if (input.mode === 'standalone') {
      action = 'pwa.standalone'
    } else {
      action = 'pwa.browser'
    }

    await logAudit({
      actorId: user.id,
      action,
      entityType: 'profile',
      entityId: user.id,
      schoolId: profile?.school_id || null,
      severity: 'INFO',
      payload: {
        mode: input.mode,
        installed: !!input.installed,
        platform: input.platform?.slice(0, 80) || null,
      },
    })

    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}
