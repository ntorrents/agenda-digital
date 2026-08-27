'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { updateFamilyProfile } from '@/app/actions/family'

export function FamilyProfileForm({ profile, email, student }: { profile: any, email: string | undefined, student: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg(false)
    
    try {
      const formData = new FormData(form)
      if (student) {
        formData.append('student_id', student.id)
      }
      
      const newPass = formData.get('new_password')
      const oldPass = formData.get('old_password')
      if (newPass && !oldPass) {
        throw new Error('Per canviar la contrasenya has d\'introduir l\'actual.')
      }

      await updateFamilyProfile(formData)
      
      // Limpiar campos de contraseña
      form.reset() // Esto resetea todo, pero queremos mantener los valores actuales de los inputs
      
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || "Error a l'operació")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Dades desades correctament
        </div>
      )}

      {/* Dades del Tutor */}
      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Les Teves Dades</h3>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Nom Complet</label>
          <input 
            required
            name="full_name"
            defaultValue={profile.full_name}
            type="text" 
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Telèfon de Contacte</label>
          <input 
            name="phone"
            defaultValue={profile.phone || ''}
            type="tel" 
            placeholder="Ex: 600 000 000"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Correu (Només Lectura)</label>
          <input 
            disabled
            value={email || ''}
            type="email" 
            className="w-full bg-stone-100/50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Alias del Niño */}
      {student && (
        <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
          <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Personalització</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Àlies de l'Infant (Opcional)</label>
            <p className="text-[10px] text-stone-400 pl-1 mb-1">Aquest és el nom curt o afectuós amb el qual vols que l'app es refereixi a l'infant.</p>
            <input 
              name="alias"
              defaultValue={student.alias || ''}
              type="text" 
              placeholder={`Ex: ${student.first_name}`}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Canviar Contrasenya */}
      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">Seguretat</h3>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Contrasenya Actual</label>
          <input 
            name="old_password"
            type="password"
            placeholder="Deixar buit si no es vol canviar"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Nova Contrasenya</label>
          <input 
            name="new_password"
            type="password"
            placeholder="Miním 6 caràcters"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSaving}
        className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} 
        Desar Canvis
      </button>

    </form>
  )
}
