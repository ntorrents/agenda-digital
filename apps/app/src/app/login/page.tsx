'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Locale } from '@/i18n'
import { PetitDiariBrandHero } from '@/components/brand/PetitDiariBrand'
import { PetitDiariBrandFooter } from '@/components/brand/PetitDiariBrandFooter'

export default function LoginPage() {
  const t = useTranslations('login')
  const locale = useLocale() as Locale
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage(t('errorCredentials'))
        } else if (error.message.includes('querying schema') || error.status === 500) {
          setErrorMessage(t('errorUnexpected'))
        } else {
          setErrorMessage(error.message)
        }
        setIsLoading(false)
        return
      }

      // Comprobar force_password_reset y rol desde profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('force_password_reset, role, status')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      if (profile?.status && profile.status !== 'active') {
        await supabase.auth.signOut()
        setErrorMessage(t('errorInactive'))
        setIsLoading(false)
        return
      }

      if (profile?.force_password_reset) {
        // Registre login abans del redirect (fire-and-forget)
        void import('@/app/actions/audit').then(({ recordLoginAudit }) => recordLoginAudit())
        window.location.assign('/force-password-reset')
        return
      }

      const role =
        profile?.role ||
        data.user.app_metadata?.role ||
        data.user.user_metadata?.role

      let dest = '/dashboard'
      if (role === 'superadmin') dest = '/superadmin'
      else if (role === 'guardian') dest = '/mi-hijo'
      else if (role === 'teacher' || role === 'admin' || role === 'auxiliary') dest = '/dashboard'
      else {
        setErrorMessage(t('errorCredentials'))
        setIsLoading(false)
        return
      }

      try {
        const { recordLoginAudit } = await import('@/app/actions/audit')
        await recordLoginAudit()
      } catch {
        // no bloquejar login si falla l'audit
      }

      window.location.assign(dest)
      return
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('errorUnexpected'))
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <PetitDiariBrandHero />
          <h1 className="text-2xl font-black tracking-tight text-stone-800">
            {t('title')}
          </h1>
          <p className="text-xs text-stone-500 max-w-[280px] mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="rounded-[28px] border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50 p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-stone-800">
              Iniciar sessió
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Accedeix amb el teu compte del centre
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-wide text-stone-600 uppercase">
                  {t('passwordLabel')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] font-bold text-[#0f766e] hover:underline"
                >
                  {t('forgotLink')}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f8f6f3] border-none text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all font-medium"
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-[#0f766e]/20 transition-all active:scale-[0.98] mt-2 group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {t('button')}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <PetitDiariBrandFooter />

      </div>
    </main>
  )
}
