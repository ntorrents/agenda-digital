'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Shield, GraduationCap, Heart, Loader2, ArrowRight, Baby } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
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
          setErrorMessage('Credencials incorrectes. Si us plau, revisa el correu i la contrasenya.')
        } else if (error.message.includes('querying schema') || error.status === 500) {
          setErrorMessage('Error de base de dades. Si us plau, executa el nou script "supabase/seed.sql" al SQL Editor de Supabase.')
        } else {
          setErrorMessage(error.message)
        }
        setIsLoading(false)
        return
      }

      // Comprobar force_password_reset
      const { data: profile } = await supabase
        .from('profiles')
        .select('force_password_reset')
        .eq('id', data.user.id)
        .single()

      if (profile?.force_password_reset) {
        router.push('/force-password-reset')
        router.refresh()
        return
      }

      // Redirigir según el rol del usuario
      const role = data.user.app_metadata?.role

      if (role === 'admin') {
        router.push('/dashboard')
      } else if (role === 'teacher') {
        router.push('/mi-aula')
      } else if (role === 'guardian') {
        router.push('/mi-hijo')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperat en iniciar sessió.')
      setIsLoading(false)
    }
  }

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('123456')
    handleLogin(undefined, demoEmail, '123456')
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0f766e] text-white shadow-xl shadow-[#0f766e]/20 mb-1 ring-8 ring-[#0f766e]/10">
            <Baby className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-800">
            Agenda Bressol
          </h1>
          <p className="text-xs text-stone-500 max-w-[280px] mx-auto">
            El dia a dia dels infants amb calidesa, senzillesa i tranquil·litat.
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
              <label className="text-xs font-bold text-stone-600">
                Correu electrònic
              </label>
              <input
                type="email"
                required
                placeholder="nom@escola.cat"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600">
                  Contrasenya
                </label>
                <span className="text-[11px] text-[#0f766e] font-medium hover:underline cursor-pointer">
                  Has oblidat?
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/30 focus:border-[#0f766e] transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#0f766e] hover:bg-[#0d665f] active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-[#0f766e]/25 transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar a l&apos;Agenda <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Quick Demo Access Pills */}
          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Prova ràpida en 1 clic
              </span>
              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                Demo
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@bressol.cat')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-teal-50/80 border border-teal-100 hover:bg-teal-100 hover:border-teal-200 text-[#0f766e] transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Shield className="h-4 w-4 mb-1 text-[#0f766e]" />
                <span className="text-xs font-bold">Direcció</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('educadora@bressol.cat')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-orange-50/80 border border-orange-100 hover:bg-orange-100 hover:border-orange-200 text-orange-800 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <GraduationCap className="h-4 w-4 mb-1 text-orange-600" />
                <span className="text-xs font-bold">Educadora</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('familia@bressol.cat')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-amber-50/80 border border-amber-100 hover:bg-amber-100 hover:border-amber-200 text-amber-900 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Heart className="h-4 w-4 mb-1 text-amber-600" />
                <span className="text-xs font-bold">Família</span>
              </button>
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
