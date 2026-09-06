'use client'

import { useEffect } from 'react'
import { Download, Share, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { reportPwaClient } from '@/app/actions/pwa-telemetry'
import { isStandaloneDisplay, isIosDevice, isAndroidDevice } from '@/lib/pwa/detect'

export function PwaInstallPrompt() {
  const t = useTranslations('pwa')
  const {
    ready,
    shouldPrompt,
    isIos,
    canNativePrompt,
    showIosHelp,
    promptInstall,
    openIosHelp,
    closeIosHelp,
    dismiss,
  } = usePwaInstall()

  if (!ready || !shouldPrompt) return null

  // Android sense beforeinstallprompt encara: no mostrem banner buit
  if (!isIos && !canNativePrompt) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px]">
        <div className="w-full max-w-sm rounded-[24px] border border-teal-200 bg-white shadow-2xl shadow-teal-900/15 p-5 flex gap-3 items-start relative">
          <div className="h-11 w-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-3 pr-6">
            <div>
              <p className="text-base font-black text-stone-900">{t('installTitle')}</p>
              <p className="text-sm text-stone-500 leading-relaxed mt-1">
                {t('installDesc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isIos ? (
                <button
                  type="button"
                  onClick={openIosHelp}
                  className="text-xs font-bold bg-teal-600 text-white px-4 py-2.5 rounded-xl"
                >
                  {t('howToInstall')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  className="text-xs font-bold bg-teal-600 text-white px-4 py-2.5 rounded-xl"
                >
                  {t('install')}
                </button>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="text-xs font-bold text-stone-500 px-4 py-2.5 rounded-xl hover:bg-stone-100"
              >
                {t('notNow')}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 p-1"
            aria-label={t('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showIosHelp && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-black text-stone-900">{t('iosTitle')}</h3>
            </div>
            <ol className="space-y-3 text-sm text-stone-600 list-decimal list-inside">
              <li>{t('iosStep1')}</li>
              <li>{t('iosStep2')}</li>
              <li>{t('iosStep3')}</li>
            </ol>
            <p className="text-[11px] text-stone-400">
              {t('iosNote')}
            </p>
            <button
              type="button"
              onClick={closeIosHelp}
              className="w-full text-sm font-bold bg-stone-900 text-white py-3 rounded-xl"
            >
              {t('understood')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/** Registra el Service Worker un cop al carregar l'app. */
export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('[pwa] SW register failed', err)
    })

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'PUSH_NAVIGATE') return
      const url = event.data.url
      if (typeof url !== 'string' || !url) return
      // Navega a la ruta de la notificació (agenda, menú, avisos…).
      window.location.assign(url)
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [])

  return null
}

/** Informa a audit_logs si l'usuari obre en PWA o navegador (1 cop/sessió). */
export function PwaTelemetryReporter() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mode = isStandaloneDisplay() ? 'standalone' : 'browser'
    const key = `pd_pwa_mode_reported:${mode}`
    try {
      if (sessionStorage.getItem(key) === '1') return
    } catch {
      /* private mode */
    }

    const platform = isIosDevice() ? 'ios' : isAndroidDevice() ? 'android' : 'desktop'
    void reportPwaClient({ mode, platform }).then((res) => {
      if (!res?.ok) return
      try {
        sessionStorage.setItem(key, '1')
      } catch {
        /* private mode */
      }
    })
  }, [])

  return null
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaServiceWorkerRegister />
      <PwaTelemetryReporter />
      <PwaInstallPrompt />
      {children}
    </>
  )
}
