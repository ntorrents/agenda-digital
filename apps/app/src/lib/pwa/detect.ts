/** Detecció de dispositiu / mode PWA (client-only). */

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  // iPadOS 13+ es presenta com MacIntel amb touch
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent || '')
}

/** Mòbil / tablet tàctil — ignora escriptori. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  if (isIosDevice() || isAndroidDevice()) return true
  return /Mobile|Tablet|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  )
}

/** Ja instal·lada o oberta com a standalone. */
export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return mq || iosStandalone
}

export function canUseWebPush(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

const DISMISS_KEY = 'pd_pwa_install_dismissed'

export function isInstallPromptDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(DISMISS_KEY) === '1'
}

export function dismissInstallPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* private mode */
  }
}
