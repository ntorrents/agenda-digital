'use client'

import { useState } from 'react'
import { Loader2, Building2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClassroom, updateClassroom } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: string
  full_name: string
}

interface ClassroomDetailFormProps {
  teachers: Teacher[]
  initialData?: any
}

export function ClassroomDetailForm({ teachers, initialData }: ClassroomDetailFormProps) {
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
        await updateClassroom(formData)
      } else {
        await createClassroom(formData)
      }
      router.push('/dashboard/config/aulas')
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
          <Building2 className="h-5 w-5 text-teal-600" />
          <h4 className="font-black text-stone-900">Dades de l&apos;Aula</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Nom de l&apos;aula</label>
          <input 
            required
            name="name"
            defaultValue={initialData?.name}
            type="text" 
            placeholder="Ex: Picarols"
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Nivell</label>
            <select 
              required
              name="level"
              defaultValue={initialData?.level || 'I0'}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
            >
              <option value="I0">I0 (0-1 anys)</option>
              <option value="I1">I1 (1-2 anys)</option>
              <option value="I2">I2 (2-3 anys)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Capacitat</label>
            <input 
              required
              name="capacity"
              type="number"
              min="1"
              defaultValue={initialData?.capacity || 15}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Assignació Educadores */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h4 className="font-black text-stone-900">Equip Educatiu</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Educadora Principal</label>
          <select 
            name="teacher_id"
            defaultValue={initialData?.teacher_id || 'none'}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="none">Sense assignar de moment</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Educadores de Suport / Auxiliars (Opcional)</label>
          <select 
            name="auxiliary_teacher_ids"
            multiple
            defaultValue={initialData?.auxiliary_teacher_ids || []}
            className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            {teachers.map(t => (
              <option key={t.id} value={t.id} className="py-1">{t.full_name}</option>
            ))}
          </select>
          <p className="text-[10px] text-stone-400 font-medium pl-1 pt-1">
            Mantingues premuda la tecla Ctrl (o Cmd en Mac) per seleccionar múltiples opcions.
          </p>
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
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? 'Desar canvis' : 'Desar Aula')}
        </Button>
      </div>

    </form>
  )
}
