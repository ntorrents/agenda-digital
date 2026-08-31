'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle2, Loader2, KeyRound } from 'lucide-react'
import { sendWelcomeEmail } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SendAccessButtonProps {
  userId: string
  email: string
  alreadySent: boolean
}

export function SendAccessButton({ userId, email, alreadySent }: SendAccessButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(alreadySent)
  const router = useRouter()

  useEffect(() => {
    setSent(alreadySent)
  }, [alreadySent])

  const handleSend = async () => {
    if (sent) {
      if (!window.confirm(`¿Estás seguro de que quieres resetear la contraseña de ${email}? El usuario recibirá una nueva contraseña y se cerrará su sesión actual.`)) {
        return
      }
    }

    setLoading(true)
    try {
      const result = await sendWelcomeEmail(userId)
      if (result.success) {
        setSent(true)
        router.refresh()
        alert(`Accés ${sent ? 'reenviat' : 'enviat'} a ${email}. Revisa la safata d'entrada (i spam).`)
      }
    } catch (error: any) {
      alert(error.message || 'Error al enviar acceso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleSend}
      disabled={loading}
      variant={sent ? "outline" : "default"}
      size="sm"
      className={`h-9 px-3 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
        sent 
          ? 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
          : 'bg-teal-600 hover:bg-teal-700 text-white'
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : sent ? (
        <>
          <KeyRound className="h-4 w-4" /> Resetear Contraseña
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" /> Enviar Acceso
        </>
      )}
    </Button>
  )
}
