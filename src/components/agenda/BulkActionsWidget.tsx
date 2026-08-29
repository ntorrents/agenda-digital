'use client'

import { useState } from 'react'
import { CheckSquare, Utensils, MessageSquarePlus, ChevronDown, Loader2 } from 'lucide-react'
import { bulkMarkPresent, bulkMarkLunch, bulkAddNote } from '@/app/actions/daily-logs'

export function BulkActionsWidget({ dateStr, onActionComplete }: { dateStr: string, onActionComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState('')

  const handleAction = async (action: 'present' | 'lunch' | 'note') => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      if (action === 'present') {
        const res = await bulkMarkPresent(dateStr)
        if (res.count && res.count > 0) {
          alert(`S'han creat ${res.count} agendes en blanc pels alumnes pendents.`)
        } else {
          alert('Tots els alumnes ja tenen agenda avui.')
        }
      } else if (action === 'lunch') {
        if (window.confirm("Això marcarà que TOTS els alumnes han menjat 'Tot' avui. N'estàs segur?")) {
          await bulkMarkLunch(dateStr)
          alert("S'ha actualitzat el dinar a TOTS els alumnes.")
        }
      } else if (action === 'note') {
        if (note.trim().length === 0) {
          setIsLoading(false)
          return
        }
        await bulkAddNote(dateStr, note)
        alert("S'ha afegit la nota a totes les agendes d'avui.")
        setNote('')
        setShowNoteInput(false)
      }
      
      setIsOpen(false)
      if (onActionComplete) onActionComplete()
      
    } catch (error) {
      console.error(error)
      alert("Hi ha hagut un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => !showNoteInput && setIsOpen(!isOpen)}
        className="bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-1.5"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
        Registre Massiu
        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !showNoteInput && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-10 overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-2 space-y-1">
            <button 
              onClick={() => handleAction('present')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              Crear agendes a la resta
            </button>
            <button 
              onClick={() => handleAction('lunch')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2"
            >
              <Utensils className="h-4 w-4 text-amber-600" />
              Tots han dinat "Tot"
            </button>
            <button 
              onClick={() => setShowNoteInput(true)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2"
            >
              <MessageSquarePlus className="h-4 w-4 text-blue-600" />
              Afegir nota a tots
            </button>
          </div>
        </div>
      )}

      {isOpen && showNoteInput && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-10 p-3 animate-in fade-in">
          <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-2 block">Nota massiva</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            rows={3}
            placeholder="Aquesta nota s'afegirà a totes les agendes d'avui..."
          />
          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => setShowNoteInput(false)}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 hover:bg-stone-100"
            >
              Cancel·lar
            </button>
            <button 
              onClick={() => handleAction('note')}
              disabled={isLoading || !note.trim()}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? 'Desant...' : 'Desar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
