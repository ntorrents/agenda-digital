'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { sendMassWelcomeEmails } from '@/app/actions/admin'

export function MassAccessSender() {
  const [loadingFamilies, setLoadingFamilies] = useState(false)
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const handleSend = async (role: 'guardian' | 'teacher') => {
    if (role === 'guardian') setLoadingFamilies(true)
    else setLoadingTeachers(true)

    try {
      const result = await sendMassWelcomeEmails(role)
      if (result.success) {
        alert(
          result.count === 0
            ? 'No hi ha usuaris pendents d\'enviar.'
            : `Accés generat per a ${result.count} usuari(s). Revisa la consola del servidor (claus temporals) fins que configures el correu.`
        )
      }
    } catch (error: any) {
      alert(error.message || 'Error al enviar accesos')
    } finally {
      setLoadingFamilies(false)
      setLoadingTeachers(false)
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-stone-900">Envío Masivo de Accesos</h3>
        <p className="text-xs text-stone-500 mt-1">
          Envía las credenciales de acceso a los usuarios que todavía no las han recibido.
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-stone-100">
        <button
          onClick={() => handleSend('guardian')}
          disabled={loadingFamilies || loadingTeachers}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 group-hover:bg-teal-100 rounded-lg transition-colors">
              <Mail className="h-4 w-4 text-stone-600 group-hover:text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800 group-hover:text-teal-900">Familias</p>
              <p className="text-xs text-stone-500 group-hover:text-teal-700">Padres y tutores</p>
            </div>
          </div>
          {loadingFamilies && <Loader2 className="h-4 w-4 text-teal-600 animate-spin" />}
        </button>

        <button
          onClick={() => handleSend('teacher')}
          disabled={loadingFamilies || loadingTeachers}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 group-hover:bg-amber-100 rounded-lg transition-colors">
              <Mail className="h-4 w-4 text-stone-600 group-hover:text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-900">Educadoras</p>
              <p className="text-xs text-stone-500 group-hover:text-amber-700">Equipo docente</p>
            </div>
          </div>
          {loadingTeachers && <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />}
        </button>
      </div>
    </div>
  )
}
