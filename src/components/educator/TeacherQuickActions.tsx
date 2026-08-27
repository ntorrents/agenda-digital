'use client'

import { useState } from 'react'
import { Camera, MessageCircle, CheckCircle2, Loader2, AlertTriangle, X, Upload } from 'lucide-react'
import { addGroupPhoto } from '@/app/actions/teacher-dashboard'
import { bulkAddNote } from '@/app/actions/daily-logs'

export function TeacherQuickActions({ dateStr }: { dateStr: string }) {
  const [modal, setModal] = useState<'photo' | 'message' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [msgContent, setMsgContent] = useState('')

  const handleAddPhoto = async () => {
    setIsLoading(true)
    try {
      const res = await addGroupPhoto(dateStr)
      setSuccessMsg(`Foto afegida a ${res.count} agendes d'avui.`)
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsLoading(false)
      setModal(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    }
  }

  const handleSendMessage = async () => {
    if (!msgContent.trim()) return
    setIsLoading(true)
    try {
      await bulkAddNote(dateStr, msgContent)
      setSuccessMsg(`Nota general enviada a totes les agendes d'avui.`)
      setMsgContent('')
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsLoading(false)
      setModal(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    }
  }

  return (
    <>
      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setModal('photo')}
          className="flex items-center justify-center gap-2 py-4 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
        >
          <Camera className="h-5 w-5 text-teal-700" />
          <span>Foto grupal</span>
        </button>
        <button
          onClick={() => setModal('message')}
          className="flex items-center justify-center gap-2 py-4 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
        >
          <MessageCircle className="h-5 w-5 text-cyan-600" />
          <span>Nota global</span>
        </button>
      </div>

      {/* Modal Foto */}
      {modal === 'photo' && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl p-5 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-stone-900">Pujar Foto Grupal</h3>
              <button onClick={() => setModal(null)} className="text-stone-400 bg-stone-100 p-1.5 rounded-full"><X className="h-4 w-4"/></button>
            </div>
            <p className="text-sm text-stone-600 mb-4">Aquesta imatge s'afegirà a la galeria de TOTS els alumnes que tinguin l'agenda creada avui.</p>
            <div className="h-32 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 mb-4 bg-stone-50">
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold">Simulació: S'usarà una imatge de prova</span>
            </div>
            <button 
              onClick={handleAddPhoto}
              disabled={isLoading}
              className="w-full h-12 bg-teal-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Afegir a les agendes
            </button>
          </div>
        </div>
      )}

      {/* Modal Mensaje */}
      {modal === 'message' && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl p-5 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-stone-900">Nota Global (Agenda)</h3>
              <button onClick={() => setModal(null)} className="text-stone-400 bg-stone-100 p-1.5 rounded-full"><X className="h-4 w-4"/></button>
            </div>
            <p className="text-sm text-stone-600 mb-4">S'afegirà aquest text com a nota general a les agendes de TOTS els alumnes de l'aula avui.</p>
            <textarea 
              value={msgContent}
              onChange={e => setMsgContent(e.target.value)}
              placeholder="Hola famílies, recordeu que demà..."
              className="w-full h-24 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4 resize-none"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !msgContent.trim()}
              className="w-full h-12 bg-cyan-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Enviar nota global
            </button>
          </div>
        </div>
      )}
    </>
  )
}
