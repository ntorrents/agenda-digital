'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { resetRecoveryPassword } from '@/app/actions/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KeyRound, Loader2, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const t = useTranslations('login')
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/forgot-password')
      } else {
        setCheckingSession(false)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setErrorMessage(t('resetMismatch'))
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage(t('resetTooShort'))
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)

      const result = await resetRecoveryPassword(formData)

      if (result.success) {
        let dest = '/dashboard'
        if (result.role === 'superadmin') dest = '/superadmin'
        else if (result.role === 'guardian') dest = '/mi-hijo'
        window.location.assign(dest)
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('resetError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f766e]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0f766e] text-white shadow-xl shadow-[#0f766e]/20 mb-1 ring-8 ring-[#0f766e]/10">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-800">{t('resetTitle')}</h1>
          <p className="text-xs text-stone-500 max-w-[280px] mx-auto">{t('resetSubtitle')}</p>
        </div>

        <Card className="rounded-[28px] border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50 p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">{t('resetNewPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">{t('resetConfirmPassword')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold text-sm shadow-lg shadow-[#0f766e]/25 transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" /> {t('resetSubmit')}
                </span>
              )}
            </Button>
          </form>

          <Link href="/login" className="block text-center text-xs font-bold text-stone-500 hover:text-stone-800">
            {t('backToLogin')}
          </Link>
        </Card>
      </div>
    </main>
  )
}
