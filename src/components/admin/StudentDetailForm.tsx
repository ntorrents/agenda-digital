'use client'

import { useState } from 'react'
import { Save, Loader2, User, Phone, FileText, HeartPulse, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStudent, updateStudent } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface Classroom {
  id: string
  name: string
  level: string
}

interface StudentDetailFormProps {
  classrooms: Classroom[]
  initialData?: any
}

export function StudentDetailForm({ classrooms, initialData }: StudentDetailFormProps) {
  const isEditing = !!initialData
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      
      if (isEditing) {
        formData.append('id', initialData.id)
        await updateStudent(formData)
      } else {
        await createStudent(formData)
      }
      
      router.push('/dashboard/config/alumnos')
    } catch (err: any) {
      setErrorMsg(err.message || "Error a l'operació")
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Dades Bàsiques */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <User className="h-5 w-5 text-teal-600" />
          <h4 className="font-black text-stone-900">Dades Personals</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Nom</label>
            <input 
              required
              name="first_name"
              defaultValue={initialData?.first_name}
              type="text" 
              placeholder="Ex: Nil"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Cognoms</label>
            <input 
              required
              name="last_name"
              defaultValue={initialData?.last_name}
              type="text" 
              placeholder="Ex: Puig Valls"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Data de naixement</label>
            <input 
              required
              name="date_of_birth"
              defaultValue={initialData?.date_of_birth}
              type="date"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Gènere</label>
            <select 
              name="gender"
              defaultValue={initialData?.gender || ''}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
            >
              <option value="">No especificat</option>
              <option value="boy">Nen</option>
              <option value="girl">Nena</option>
              <option value="other">Altre</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-stone-500 pl-1">Aula assignada</label>
          <select 
            name="classroom_id"
            defaultValue={initialData?.classroom_id || 'none'}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
          >
            <option value="none">Sense assignar de moment</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dades Familiars */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Phone className="h-5 w-5 text-blue-600" />
          <h4 className="font-black text-stone-900">Família i Recollida</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-4 col-span-2">
              <h5 className="font-bold text-sm text-blue-700 pb-2 border-b border-blue-100">Tutor/a 1 (Obligatori)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Nom complet</label>
                  <input name="guardian_1_name" type="text" required placeholder="Nom i cognoms" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Parentiu (Ex: Mare, Pare...)</label>
                  <input name="guardian_1_relation" type="text" required placeholder="Mare" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Correu (per a l'App)</label>
                  <input name="guardian_1_email" type="email" required placeholder="correu@ejemplo.com" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Telèfon</label>
                  <input name="guardian_1_phone" type="text" required placeholder="600 000 000" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>

            <div className="space-y-4 col-span-2 pt-4">
              <h5 className="font-bold text-sm text-blue-700 pb-2 border-b border-blue-100">Tutor/a 2 (Opcional)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Nom complet</label>
                  <input name="guardian_2_name" type="text" placeholder="Nom i cognoms" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Parentiu</label>
                  <input name="guardian_2_relation" type="text" placeholder="Pare" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Correu (per a l'App)</label>
                  <input name="guardian_2_email" type="email" placeholder="correu2@ejemplo.com" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Telèfon</label>
                  <input name="guardian_2_phone" type="text" placeholder="600 000 000" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          <div className="space-y-1.5 col-span-2 pt-4">
            <label className="text-xs font-bold text-stone-500 pl-1">Persones autoritzades (Recollida) - Altres familiars</label>
            <input 
              name="authorized_pickup"
              defaultValue={initialData?.authorized_pickup}
              type="text" 
              placeholder="Ex: Avis paterns, Tieta"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Salut i Al·lèrgies */}
      <div className="bg-white p-6 rounded-[28px] border border-rose-200 shadow-xs space-y-6 bg-rose-50/10">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
          <HeartPulse className="h-5 w-5 text-rose-600" />
          <h4 className="font-black text-stone-900">Salut i Al·lèrgies</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rose-700 pl-1 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5"/> Al·lèrgies o Intoleràncies</label>
          <textarea 
            name="intolerances"
            defaultValue={initialData?.intolerances || ''}
            placeholder="Deixar buit si no en té. (Ex: Celíac, intolerància a la lactosa...)"
            className="w-full h-24 bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Notes Internes */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <FileText className="h-5 w-5 text-amber-600" />
          <h4 className="font-black text-stone-900">Notes Internes de Direcció</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Anotacions (Només visible per direcció i educadores)</label>
          <textarea 
            name="internal_notes"
            defaultValue={initialData?.internal_notes || ''}
            placeholder="Comentaris sobre adaptació, context familiar, etc..."
            className="w-full h-24 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="sticky bottom-4 z-10 flex items-center gap-3 p-4 bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-[24px] shadow-xl">
        <Button 
          type="button"
          onClick={() => router.back()}
          variant="outline"
          className="flex-1 h-12 rounded-xl text-stone-600 font-bold border-stone-200 hover:bg-stone-100"
        >
          Cancel·lar
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="flex-[2] h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? 'Desar canvis' : 'Matricular alumne')}
        </Button>
      </div>

    </form>
  )
}
