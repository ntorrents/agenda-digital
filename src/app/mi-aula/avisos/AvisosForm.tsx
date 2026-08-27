'use client'

import { useState } from 'react'
import { createAnnouncement } from '@/app/actions/announcements'
import { Loader2, Plus, Pin, Calendar, AlertCircle, Megaphone } from 'lucide-react'

export function AvisosForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 text-stone-500 font-bold hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
      >
        <Plus className="h-5 w-5" /> Crear Nou Avís
      </button>
    )
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await createAnnouncement(formData)
      setIsOpen(false)
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[28px] border border-stone-200 shadow-lg shadow-stone-200/50 p-5 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-stone-900">Nou Avís</h3>
        <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-100 px-3 py-1.5 rounded-full">
          Cancel·lar
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5 block">Tipus</label>
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
            <label className="flex-1 text-center cursor-pointer">
              <input type="radio" name="event_type" value="announcement" className="peer sr-only" defaultChecked />
              <div className="py-2 text-[11px] font-bold text-stone-500 rounded-lg peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm flex items-center justify-center gap-1.5 transition-all">
                <Megaphone className="h-3.5 w-3.5" /> Avís
              </div>
            </label>
            <label className="flex-1 text-center cursor-pointer">
              <input type="radio" name="event_type" value="event" className="peer sr-only" />
              <div className="py-2 text-[11px] font-bold text-stone-500 rounded-lg peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm flex items-center justify-center gap-1.5 transition-all">
                <Calendar className="h-3.5 w-3.5" /> Esdeveniment
              </div>
            </label>
            <label className="flex-1 text-center cursor-pointer">
              <input type="radio" name="event_type" value="alert" className="peer sr-only" />
              <div className="py-2 text-[11px] font-bold text-stone-500 rounded-lg peer-checked:bg-white peer-checked:text-red-600 peer-checked:shadow-sm flex items-center justify-center gap-1.5 transition-all">
                <AlertCircle className="h-3.5 w-3.5" /> Urgent
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5 block">Títol</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="Ex: Excursió a la granja" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5 block">Descripció (Opcional)</label>
          <textarea 
            name="description" 
            placeholder="Detalls per a les famílies..." 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 rounded-[16px] p-3 border border-stone-100">
            <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
              <Pin className="h-3 w-3" /> Destacat
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" name="is_pinned" className="w-4 h-4 text-amber-500 rounded border-stone-300 focus:ring-amber-500" />
              <span className="text-xs font-bold text-stone-700">Fixar a dalt</span>
            </label>
          </div>
          
          <div className="bg-stone-50 rounded-[16px] p-3 border border-stone-100">
            <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Data (Opcional)
            </label>
            <input type="date" name="event_date" className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-amber-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-95 transition-all mt-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publicar Avís'}
        </button>

      </form>
    </div>
  )
}
