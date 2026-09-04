import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditError } from '@/lib/audit-log'
import {
  getVapidConfig,
  toWebPushSubscription,
  type PushPayload,
} from '@/lib/push/config'

export type SendPushResult = {
  sent: number
  failed: number
  cleaned: number
}

/**
 * Envia Web Push a totes les subscripcions d'un usuari.
 * Neteja endpoints 404/410 i registra errors a audit_logs.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<SendPushResult> {
  const vapid = getVapidConfig()
  if (!vapid) {
    console.warn('[push] VAPID no configurat — skip send')
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error) {
    await logAuditError({
      action: 'error.push_send',
      entityType: 'push_subscription',
      error,
      actorId: userId,
      context: { phase: 'load_subscriptions' },
    })
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  if (!rows?.length) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    tag: payload.tag || 'petit-diari',
  })

  let sent = 0
  let failed = 0
  let cleaned = 0

  for (const row of rows) {
    try {
      await webpush.sendNotification(toWebPushSubscription(row), body, {
        TTL: 60 * 60 * 12,
      })
      sent += 1
    } catch (e: unknown) {
      failed += 1
      const statusCode =
        e && typeof e === 'object' && 'statusCode' in e
          ? Number((e as { statusCode?: number }).statusCode)
          : undefined

      if (statusCode === 404 || statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', row.id)
        cleaned += 1
      } else {
        await logAuditError({
          action: 'error.push_send',
          entityType: 'push_subscription',
          entityId: row.id,
          error: e,
          actorId: userId,
          context: {
            endpoint: row.endpoint.slice(0, 80),
            statusCode,
            title: payload.title,
          },
        })
      }
    }
  }

  return { sent, failed, cleaned }
}

/** Envia el mateix missatge a diversos usuaris (seqüencial). */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<SendPushResult> {
  const unique = [...new Set(userIds.filter(Boolean))]
  const totals: SendPushResult = { sent: 0, failed: 0, cleaned: 0 }
  for (const id of unique) {
    const r = await sendPushToUser(id, payload)
    totals.sent += r.sent
    totals.failed += r.failed
    totals.cleaned += r.cleaned
  }
  return totals
}
