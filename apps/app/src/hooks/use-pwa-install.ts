'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  dismissInstallPrompt,
  isAndroidDevice,
  isInstallPromptDismissed,
  isIosDevice,
  isMobileDevice,
  isStandaloneDisplay,
} from '@/lib/pwa/detect'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type PwaInstallState = {
  ready: boolean
  /** Mostrar UI d'instal·lació */
  shouldPrompt: boolean
  isIos: boolean
  isAndroid: boolean
  canNativePrompt: boolean
  showIosHelp: boolean
  promptInstall: () => Promise<void>
  openIosHelp: () => void
  closeIosHelp: () => void
  dismiss: () => void
}

export function usePwaInstall(): PwaInstallState {
  const [ready, setReady] = useState(false)
  const [shouldPrompt, setShouldPrompt] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    const mobile = isMobileDevice()
    const standalone = isStandaloneDisplay()
    const ios = isIosDevice()
    const android = isAndroidDevice()
    const dismissed = isInstallPromptDismissed()

    setIsIos(ios)
    setIsAndroid(android)

    const eligible = mobile && !standalone && !dismissed
    setShouldPrompt(eligible)
    setReady(true)

    if (!eligible || ios) return

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const promptInstall = useCallback(async () => {
    if (isIos) {
      setShowIosHelp(true)
      return
    }
    if (!deferred) return
    await deferred.prompt()
    try {
      await deferred.userChoice
    } catch {
      /* ignore */
    }
    setDeferred(null)
    setShouldPrompt(false)
    dismissInstallPrompt()
  }, [deferred, isIos])

  const dismiss = useCallback(() => {
    dismissInstallPrompt()
    setShouldPrompt(false)
    setShowIosHelp(false)
  }, [])

  return {
    ready,
    shouldPrompt,
    isIos,
    isAndroid,
    canNativePrompt: Boolean(deferred),
    showIosHelp,
    promptInstall,
    openIosHelp: () => setShowIosHelp(true),
    closeIosHelp: () => setShowIosHelp(false),
    dismiss,
  }
}
