'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetForcedPassword } from '@/app/actions/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Loader2, KeyRound } from 'lucide-react'

export default function ForcePasswordResetPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setErrorMessage('Les contrasenyes no coincideixen')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('La contrasenya ha de tenir almenys 6 caràcters')
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('password', password)
      formData.append('confirmPassword', confirmPassword)

      const result = await resetForcedPassword(formData)
      
      if (result.success) {
        if (result.role === 'superadmin') router.push('/superadmin')
        else if (result.role === 'admin') router.push('/dashboard')
        else if (result.role === 'teacher') router.push('/dashboard')
        else if (result.role === 'guardian') router.push('/mi-hijo')
        else router.push('/login')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en canviar la contrasenya')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full mx-auto space-y-6" style={{ maxWidth: '420px' }}>
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 mb-1 ring-8 ring-amber-500/10">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-800">
            Canvi de Contrasenya
          </h1>
          <p className="text-xs text-stone-500 max-w-[280px] mx-auto">
            Per motius de seguretat, és obligatori canviar la teva contrasenya al primer inici de sessió.
          </p>
        </div>

        <Card className="rounded-[28px] border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50 p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">
                Nova Contrasenya
              </label>
              <input
                type="password"
                required
                placeholder="Mínim 6 caràcters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">
                Confirma la Contrasenya
              </label>
              <input
                type="password"
                required
                placeholder="Repeteix la contrasenya"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" /> Actualitzar i Entrar
                </span>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
