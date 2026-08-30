import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Locale, Translations } from './types'
import { ca } from './ca'
import { es } from './es'
import { en } from './en'

export type { Locale }

const translations: Record<Locale, Translations> = { ca, es, en }

type I18nContextValue = {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

const LOCALE_KEY = 'pd-locale'

function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY) as Locale | null
  if (stored && translations[stored]) return stored
  const lang = navigator.language.slice(0, 2)
  if (lang === 'es') return 'es'
  if (lang === 'en') return 'en'
  return 'ca'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ca')

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(LOCALE_KEY, next)
    document.documentElement.lang = next
    document.title = translations[next].meta.title
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = translations[locale].meta.title
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export const localeLabels: Record<Locale, string> = {
  ca: 'CA',
  es: 'ES',
  en: 'EN',
}
