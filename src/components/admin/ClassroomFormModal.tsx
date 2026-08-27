'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClassroom } from '@/app/actions/admin'

interface Teacher {
  id: string
  full_name: string
}

export function ClassroomFormModal({ teachers }: { teachers: Teacher[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      await createClassroom(formData)
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || "Error a l'afegir l'aula")
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
        <Plus className="h-3.5 w-3.5 mr-1 text-teal-700" /> Nova aula
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0 animate-in fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">Crear Aula</h3>
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
                <label className="text-xs font-bold text-stone-500 pl-1">Nom de l&apos;aula</label>
                <input 
                  required
                  name="name"
                  type="text" 
                  placeholder="Ex: Picarols"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">Nivell</label>
                  <select 
                    required
                    name="level"
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
                    defaultValue="15"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 pl-1">Educadora assignada</label>
                <select 
                  name="teacher_id"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
                >
                  <option value="none">Sense assignar de moment</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <Button 
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer mt-2"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Desar Aula'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
