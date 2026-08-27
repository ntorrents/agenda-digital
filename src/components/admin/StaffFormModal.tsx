'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStaffMember } from '@/app/actions/admin'

export function StaffFormModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      await createStaffMember(formData)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || "Error a l'afegir el personal")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline" 
        size="sm" 
        className="rounded-2xl text-xs font-bold text-teal-800 border-teal-200 bg-teal-50/50 hover:bg-teal-100 cursor-pointer h-9"
      >
        <Plus className="h-3.5 w-3.5 mr-1 text-teal-700" /> Nou Personal
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0 animate-in fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">Afegir Personal</h3>
              <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full cursor-pointer transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 pl-1">Nom Complet</label>
                <input 
                  required
                  name="full_name"
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
                  type="email" 
                  placeholder="maria@bressol.cat"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 pl-1">Rol</label>
                <select 
                  required
                  name="role"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
                >
                  <option value="teacher">Educadora</option>
                  <option value="admin">Directora (Admin)</option>
                </select>
              </div>

              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                <p className="text-xs text-teal-800 font-medium leading-relaxed">
                  L&apos;usuari es crearà amb la contrasenya temporal: <strong className="font-black text-teal-900 bg-white px-2 py-0.5 rounded-md border border-teal-200 shadow-sm">123456</strong>
                </p>
              </div>

              <Button 
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear compte'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
