'use server'

import { createClient } from '@/lib/supabase/server'
import { logAudit, logAuditError } from '@/lib/audit-log'
import { getVapidPublicKey } from '@/lib/push/config'
import { sendPushToUser, type SendPushResult } from '@/lib/push/send'
import type { PushPayload } from '@/lib/push/config'

export async function getPushPublicKey() {
  return { publicKey: getVapidPublicKey() }
}

export async function savePushSubscription(input: {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    if (!input.endpoint || !input.p256dh || !input.auth) {
      return { error: 'Invalid subscription' }
    }

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        user_agent: input.userAgent?.slice(0, 300) || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    )

    if (error) {
      await logAuditError({
        action: 'error.push_subscribe',
        entityType: 'push_subscription',
        error,
        actorId: user.id,
      })
      return { error: error.message }
    }

    await logAudit({
      actorId: user.id,
      action: 'push.subscribe',
      entityType: 'push_subscription',
      severity: 'INFO',
      payload: { endpoint: input.endpoint.slice(0, 80) },
    })

    return { success: true }
  } catch (e) {
    await logAuditError({
      action: 'error.push_subscribe',
      entityType: 'push_subscription',
      error: e,
    })
    return { error: 'subscribe_failed' }
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (error) {
      await logAuditError({
        action: 'error.push_unsubscribe',
        entityType: 'push_subscription',
        error,
        actorId: user.id,
      })
      return { error: error.message }
    }

    await logAudit({
      actorId: user.id,
      action: 'push.unsubscribe',
      entityType: 'push_subscription',
      severity: 'INFO',
      payload: { endpoint: endpoint.slice(0, 80) },
    })

    return { success: true }
  } catch (e) {
    await logAuditError({
      action: 'error.push_unsubscribe',
      entityType: 'push_subscription',
      error: e,
    })
    return { error: 'unsubscribe_failed' }
  }
}

export async function getMyPushSubscriptionStatus() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { subscribed: false }

    const { count } = await supabase
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return { subscribed: (count || 0) > 0 }
  } catch {
    return { subscribed: false }
  }
}

/**
 * Utilitat per altres Server Actions (agenda, avisos, missatges…).
 * No exposar a clients no autoritzats: només cridar des del servidor.
 */
export async function notifyUser(
  userId: string,
  payload: PushPayload
): Promise<SendPushResult> {
  return sendPushToUser(userId, payload)
}

/**
 * Prova end-to-end (només PRE / local). No exposar a la UI de producció.
 */
export async function sendTestPushToMe() {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'unavailable' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated' }

    const result = await sendPushToUser(user.id, {
      title: 'Petit Diari',
      body: 'Notificació de prova — tot correcte!',
      url: '/mi-hijo/agenda',
      tag: 'push-test',
    })

    if (result.sent === 0) {
      return {
        error:
          result.failed > 0
            ? 'No s\'ha pogut enviar (subscripció invàlida?)'
            : 'No hi ha cap dispositiu subscrit',
        result,
      }
    }

    return { success: true, result }
  } catch (e) {
    await logAuditError({
      action: 'error.push_send',
      entityType: 'push_subscription',
      error: e,
    })
    return { error: 'test_failed' }
  }
}
