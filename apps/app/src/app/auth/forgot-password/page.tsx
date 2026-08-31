'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Locale } from '@/i18n'
import { PetitDiariBrandHero } from '@/components/brand/PetitDiariBrand'
import { PetitDiariBrandFooter } from '@/components/brand/PetitDiariBrandFooter'

export default function ForgotPasswordPage() {
  const t = useTranslations('login')
  const locale = useLocale() as Locale
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/reset-password')}`

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
        return
      }

      setSent(true)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('forgotError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        <div className="text-center space-y-2">
          <PetitDiariBrandHero />
          <h1 className="text-2xl font-black tracking-tight text-stone-800">{t('forgotTitle')}</h1>
          <p className="text-xs text-stone-500 max-w-[300px] mx-auto">{t('forgotSubtitle')}</p>
        </div>

        <Card className="rounded-[28px] border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50 p-6 space-y-5">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Mail className="h-6 w-6" />
              </div>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">{t('forgotSent')}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium leading-relaxed">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-wide text-stone-600 uppercase">
                    {t('emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f6f3] border-none text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all font-medium"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-[#0f766e]/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('forgotSubmit')}
                </Button>
              </form>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t('backToLogin')}
              </Link>
            </>
          )}
        </Card>

        <PetitDiariBrandFooter />
      </div>
    </main>
  )
}
