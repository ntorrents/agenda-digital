'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Shield, GraduationCap, Heart, Loader2, ArrowRight, Baby, Crown } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Locale } from '@/i18n'

export default function LoginPage() {
  const t = useTranslations('login')
  const locale = useLocale() as Locale
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    const loginEmail = customEmail || email
    const loginPassword = customPassword || password

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage(t('errorCredentials'))
        } else if (error.message.includes('querying schema') || error.status === 500) {
          setErrorMessage('Error de base de dades. Si us plau, executa el nou script "supabase/seed.sql" al SQL Editor de Supabase.')
        } else {
          setErrorMessage(error.message)
        }
        setIsLoading(false)
        return
      }

      // Comprobar force_password_reset y rol desde profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('force_password_reset, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profile?.force_password_reset) {
        window.location.assign('/force-password-reset')
        return
      }

      const role = profile?.role || data.user.app_metadata?.role
      let dest = '/dashboard'
      if (role === 'superadmin') dest = '/superadmin'
      else if (role === 'guardian') dest = '/mi-hijo'

      window.location.assign(dest)
      return
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('errorUnexpected'))
      setIsLoading(false)
    }
  }

  const handleQuickDemo = (demoEmail: string, demoPassword = '123456') => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    handleLogin(undefined, demoEmail, demoPassword)
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        
        {/* Header Branding */}
        <div className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0">
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0f766e] text-white shadow-xl shadow-[#0f766e]/20 mb-1 ring-8 ring-[#0f766e]/10">
            <Baby className="h-8 w-8" />
          </div>
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

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
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
              <label className="text-xs font-bold tracking-wide text-stone-600 uppercase">
                {t('passwordLabel')}
              </label>
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

          {/* Quick Demo Access Pills */}
          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <div className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-400 text-center flex items-center justify-center gap-2">
                <span className="h-px bg-stone-200 w-8"></span>
                {t('demoTitle')}
                <span className="h-px bg-stone-200 w-8"></span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickDemo('f1@cole.cat')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-xs hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
                >
                  <Heart className="h-5 w-5 text-pink-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-700">{t('demoFamily')}</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('p1@cole.cat')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-xs hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                >
                  <Sparkles className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-700">{t('demoTeacher')}</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('d@cole.cat')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-xs hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
                >
                  <Shield className="h-5 w-5 text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-700">{t('demoAdmin')}</span>
                </button>
                <button
                  onClick={() => handleQuickDemo('superadmin@bressol.cat')}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white border border-stone-200/60 shadow-xs hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
                >
                  <Crown className="h-5 w-5 text-violet-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-700">{t('demoSuperAdmin')}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-stone-400 font-medium">
            Pas A Pas • Escoles Bressol & Llar d&apos;infants
          </p>
        </div>

      </div>
    </main>
  )
}
