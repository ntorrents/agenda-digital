'use client'

import { useState } from 'react'
import { Save, Loader2, User, Mail, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStaffMember, updateStaffMember } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

interface StaffDetailFormProps {
  initialData?: any
}

export function StaffDetailForm({ initialData }: StaffDetailFormProps) {
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
        await updateStaffMember(formData)
      } else {
        await createStaffMember(formData)
      }
      router.push('/dashboard/config/personal')
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
            <label className="text-xs font-bold text-stone-500 pl-1">Nom Complet</label>
            <input 
              required
              name="full_name"
              defaultValue={initialData?.full_name}
              type="text" 
              placeholder="Ex: Maria Garcia"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Correu electrònic</label>
            <input 
              required
              name="email"
              defaultValue={initialData?.email}
              type="email" 
              placeholder="maria@bressol.cat"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Telèfon (Opcional)</label>
            <input 
              name="phone"
              defaultValue={initialData?.phone || ''}
              type="text" 
              placeholder="Ex: 600 123 456"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Permisos i Estat */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <ShieldAlert className="h-5 w-5 text-blue-600" />
          <h4 className="font-black text-stone-900">Rol i Permisos</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Rol</label>
            <select 
              required
              name="role"
              defaultValue={initialData?.role || 'teacher'}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="teacher">Educadora</option>
              <option value="admin">Directora (Admin)</option>
            </select>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 pl-1">Estat de l&apos;usuari</label>
              <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 border border-stone-200 rounded-xl h-[46px]">
                <input 
                  type="checkbox"
                  name="is_active"
                  defaultChecked={initialData?.is_active}
                  id="is_active"
                  className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
                  Compte Actiu
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info per a nou usuari */}
      {!isEditing && (
        <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
          <p className="text-xs text-teal-800 font-medium leading-relaxed">
            L&apos;usuari es crearà amb la contrasenya temporal: <strong className="font-black text-teal-900 bg-white px-2 py-0.5 rounded-md border border-teal-200 shadow-sm">123456</strong>
          </p>
        </div>
      )}

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
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? 'Desar canvis' : 'Crear compte')}
        </Button>
      </div>

    </form>
  )
}
