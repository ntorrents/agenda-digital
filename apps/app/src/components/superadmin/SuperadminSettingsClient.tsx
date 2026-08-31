'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setLocaleAction } from '@/app/actions/locale'
import { Locale } from '@/i18n'
import { SaPanel, SaPanelHeader } from './sa-ui'

const languages: { code: Locale; name: string }[] = [
  { code: 'ca', name: 'Català' },
  { code: 'es', name: 'Castellano' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
]

export function SuperadminSettingsClient({
  currentLocale,
  email,
  fullName,
}: {
  currentLocale: Locale
  email: string
  fullName: string | null
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const changeLocale = (locale: Locale) => {
    if (locale === currentLocale) return
    startTransition(async () => {
      await setLocaleAction(locale)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 max-w-lg">
      <SaPanel>
        <SaPanelHeader title="Compte" />
        <div className="p-4 space-y-2 text-sm">
          <p>
            <span className="text-stone-500">Nom:</span>{' '}
            <span className="text-stone-200">{fullName || '—'}</span>
          </p>
          <p>
            <span className="text-stone-500">Correu:</span>{' '}
            <span className="text-stone-200">{email}</span>
          </p>
          <p className="text-xs text-stone-500 pt-2">
            Per canviar la contrasenya, utilitza el flux estàndard de l&apos;app.
          </p>
          <Link
            href="/force-password-reset"
            className="inline-block mt-2 text-sm text-violet-400 hover:underline"
          >
            Canviar contrasenya →
          </Link>
        </div>
      </SaPanel>

      <SaPanel>
        <SaPanelHeader title="Idioma de la interfície" />
        <div className="p-4">
          <p className="text-xs text-stone-500 mb-3">Afecta etiquetes i missatges traduïts de l&apos;app.</p>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                disabled={pending}
                onClick={() => changeLocale(lang.code)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  currentLocale === lang.code
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </SaPanel>
    </div>
  )
}
