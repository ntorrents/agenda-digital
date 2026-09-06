'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  getMyPushSubscriptionStatus,
  getPushPublicKey,
  removePushSubscription,
  savePushSubscription,
} from '@/app/actions/push'
import { canUseWebPush, isStandaloneDisplay, isIosDevice } from '@/lib/pwa/detect'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationsCard() {
  const t = useTranslations('push')
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [iosHint, setIosHint] = useState(false)

  const refresh = useCallback(async () => {
    const ok = canUseWebPush()
    setSupported(ok)
    setIosHint(isIosDevice() && !isStandaloneDisplay())
    if (!ok) {
      setLoading(false)
      return
    }
    setPermission(Notification.permission)
    const status = await getMyPushSubscriptionStatus()
    setSubscribed(status.subscribed)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const enable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      if (isIosDevice() && !isStandaloneDisplay()) {
        setMessage(t('iosInstallRequired'))
        setBusy(false)
        return
      }

      const { publicKey } = await getPushPublicKey()
      if (!publicKey) {
        setMessage(t('vapidMissing'))
        setBusy(false)
        return
      }

      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setMessage(t('permissionDenied'))
        setBusy(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      const json = sub.toJSON()
      const endpoint = json.endpoint
      const p256dh = json.keys?.p256dh
      const auth = json.keys?.auth
      if (!endpoint || !p256dh || !auth) {
        setMessage(t('subscribeFailed'))
        setBusy(false)
        return
      }

      const result = await savePushSubscription({
        endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      })

      if (result.error) {
        setMessage(result.error)
      } else {
        setSubscribed(true)
        setMessage(t('enabled'))
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('enableError'))
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await removePushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
      setMessage(t('disabled'))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('disableError'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-stone-200 bg-white p-5 flex items-center gap-2 text-stone-400 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> {t('loading')}
      </div>
    )
  }

  if (!supported) {
    return (
      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5 space-y-1">
        <h3 className="text-sm font-black text-stone-800 flex items-center gap-2">
          <BellOff className="h-4 w-4" /> {t('title')}
        </h3>
        <p className="text-xs text-stone-500">
          {t('unsupported')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <div className="bg-teal-50 text-teal-700 p-2 rounded-xl">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider">
            {t('title')}
          </h3>
          <p className="text-[11px] text-stone-500">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {iosHint && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          {t('iosHint')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {subscribed && permission === 'granted' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void disable()}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('disable')}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void enable()}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin inline" /> : t('enable')}
          </button>
        )}
        <span className="text-[11px] text-stone-400">
          {subscribed && permission === 'granted'
            ? t('statusActive')
            : permission === 'denied'
              ? t('statusDenied')
              : t('statusPending')}
        </span>
      </div>

      {message && <p className="text-[11px] font-medium text-stone-600">{message}</p>}
    </div>
  )
}
