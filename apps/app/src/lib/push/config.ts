import type { PushSubscription as WebPushSubscription } from 'web-push'

export type PushPayload = {
  title: string
  body: string
  /** Ruta relativa o absoluta dins l'app (ex. /mi-hijo/agenda?date=2026-09-04) */
  url?: string
  tag?: string
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
}

export function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:hola@petitdiari.com'

  if (!publicKey || !privateKey) {
    return null
  }

  return { publicKey, privateKey, subject }
}

export function toWebPushSubscription(row: {
  endpoint: string
  p256dh: string
  auth: string
}): WebPushSubscription {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }
}
