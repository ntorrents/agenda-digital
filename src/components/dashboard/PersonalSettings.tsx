'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { setLocaleAction } from '@/app/actions/locale'
import { Locale } from '@/i18n'
import { cn } from '@/lib/utils'

export function PersonalSettings() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const currentLocale = useLocale() as Locale
  const tProfile = useTranslations('familyProfile') // Reuse language selector translations

  const handleLanguageChange = (locale: Locale) => {
    if (locale === currentLocale) return
    startTransition(async () => {
      await setLocaleAction(locale)
      router.refresh()
    })
  }

  const languages = [
    { code: 'ca', name: 'Català' },
    { code: 'es', name: 'Castellano' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
  ]

  return (
    <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-sm space-y-4 max-w-lg">
      <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">{tProfile('languageTitle')}</h3>
      <p className="text-xs text-stone-500 font-medium">{tProfile('languageDesc')}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code as Locale)}
            disabled={isPending}
            className={cn(
              "py-3 px-4 text-sm font-bold rounded-2xl border transition-all cursor-pointer text-center",
              currentLocale === lang.code 
                ? "bg-teal-50 border-teal-200 text-teal-700 font-extrabold" 
                : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
            )}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
