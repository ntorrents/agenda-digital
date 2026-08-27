'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wrench, CheckSquare, Utensils, MessageSquare, AlertTriangle, Loader2, X } from 'lucide-react'
import { bulkMarkPresent, bulkMarkLunch, bulkAddNote } from '@/app/actions/daily-logs'

type ActionType = 'present' | 'lunch' | null

export default function EducatorToolsPage() {
  const searchParams = useSearchParams()
  const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
  
  const [confirmAction, setConfirmAction] = useState<ActionType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [noteText, setNoteText] = useState('')

  const handleAction = async () => {
    setIsLoading(true)
    setSuccessMsg('')
    
    try {
      if (confirmAction === 'present') {
        const result = await bulkMarkPresent(dateStr)
        if (result.success) {
          setSuccessMsg(result.count === 0 
            ? 'Tots els alumnes ja tenien un registre creat avui.' 
            : `S'han marcat ${result.count} alumnes com a presents.`)
        }
      } 
      else if (confirmAction === 'lunch') {
        await bulkMarkLunch(dateStr)
        setSuccessMsg("S'ha marcat 'Tot' al dinar per a tots els presents.")
      }
    } catch (error) {
      alert('Hi ha hagut un error.')
    } finally {
      setIsLoading(false)
      setConfirmAction(null)
      setTimeout(() => setSuccessMsg(''), 5000)
    }
  }

  const tools = [
    { 
      id: 'present' as ActionType,
      title: 'Marcar tots com a presents', 
      desc: 'Crea una agenda automàtica per a tots els alumnes pendents.', 
      icon: CheckSquare, 
      color: 'emerald',
    },
    { 
      id: 'lunch' as ActionType,
      title: 'Dinar per defecte', 
      desc: 'Posa "S\'ho ha menjat tot" a tots els presents.', 
      icon: Utensils, 
      color: 'orange',
    },
  ]

  const getConfirmationConfig = () => {
    switch (confirmAction) {
      case 'present': return {
        title: 'Estàs segura?',
        desc: 'Aquesta acció crearà una agenda bàsica (estat tranquil) per a tots els alumnes que encara no tinguin registre avui.',
        btnText: 'Sí, continuar'
      }
      case 'lunch': return {
        title: 'Dinar per defecte',
        desc: 'S\'actualitzaran les agendes de tots els alumnes PRESENTS marcant que s\'ho han menjat "Tot" al dinar. Aquesta acció sobreescriurà el que hi hagués abans al dinar.',
        btnText: 'Sí, aplicar dinar'
      }
      default: return null
    }
  }

  const conf = getConfirmationConfig()

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Wrench className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Eines de Productivitat</h2>
      </div>

      {successMsg && (
        <div className="p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {confirmAction && conf && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black text-stone-900">{conf.title}</h3>
              </div>
              <button onClick={() => setConfirmAction(null)} className="text-stone-400 hover:text-stone-700 bg-stone-100 p-1.5 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-stone-600 leading-relaxed">
                {conf.desc}
              </p>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setConfirmAction(null)}
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl bg-stone-100 text-stone-700 font-bold text-sm hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancel·lar
                </button>
                <button 
                  onClick={handleAction}
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : conf.btnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tools.map((tool) => (
          <button 
            key={tool.id} 
            onClick={() => setConfirmAction(tool.id)}
            className={`w-full text-left rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs hover:border-${tool.color}-300 hover:bg-${tool.color}-50/30 transition-all cursor-pointer group`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${tool.color}-50 text-${tool.color}-600 group-hover:scale-110 transition-transform shrink-0`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-800">{tool.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{tool.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}
