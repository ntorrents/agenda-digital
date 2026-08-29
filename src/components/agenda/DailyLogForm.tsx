'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Smile, Utensils, Droplets, Moon, CheckCircle2, XCircle, ArrowLeft, Camera, Image as ImageIcon, Loader2 } from 'lucide-react'
import { upsertDailyLog } from '@/app/actions/daily-logs'

interface DailyLogFormProps {
  studentId: string
  studentName: string
  dateStr: string
  initialData?: any
  settings?: any
}

export function DailyLogForm({ studentId, studentName, dateStr, initialData, settings = {} }: DailyLogFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [mood, setMood] = useState<string | null>(initialData?.mood || null)
  const [breakfast, setBreakfast] = useState<string | null>(initialData?.meal_breakfast || null)
  const [lunch, setLunch] = useState<string | null>(initialData?.meal_lunch || null)
  const [snack, setSnack] = useState<string | null>(initialData?.meal_snack || null)
  const [diaperType, setDiaperType] = useState<string | null>(initialData?.diaper_type || null)
  const [diaperChanges, setDiaperChanges] = useState<number>(initialData?.diaper_changes || 0)
  
  // Basic boolean for UI, but backend expects time strings. We'll simplify for now.
  const [didNap, setDidNap] = useState<boolean>(!!(initialData?.nap_start && initialData?.nap_end))
  const [napStart, setNapStart] = useState<string>(initialData?.nap_start || '13:00')
  const [napEnd, setNapEnd] = useState<string>(initialData?.nap_end || '14:30')
  
  const [notes, setNotes] = useState<string>(initialData?.notes || '')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('student_id', studentId)
      formData.append('date', dateStr)
      if (mood) formData.append('mood', mood)
      if (breakfast) formData.append('meal_breakfast', breakfast)
      if (lunch) formData.append('meal_lunch', lunch)
      if (snack) formData.append('meal_snack', snack)
      if (diaperType) formData.append('diaper_type', diaperType)
      formData.append('diaper_changes', diaperChanges.toString())
      if (didNap) {
        formData.append('nap_start', napStart)
        formData.append('nap_end', napEnd)
      }
      if (notes) formData.append('notes', notes)

      await upsertDailyLog(formData)
      
      // Redirect to the same page with ?success=true
      router.push(`/mi-aula/alumnos/${studentId}?date=${dateStr}&success=true`)
      
    } catch (error) {
      console.error('Error saving log:', error)
      alert('Error en desar les dades')
    } finally {
      setIsSaving(false)
    }
  }

  // Helper arrays for options
  const mealOptions = [
    { value: 'all', label: 'Tot', color: 'emerald' },
    { value: 'most', label: 'Molt', color: 'teal' },
    { value: 'little', label: 'Poc', color: 'amber' },
    { value: 'none', label: 'Res', color: 'red' },
  ]
  const diaperOptions = [
    { value: 'pee', label: 'Pipí', color: 'amber' },
    { value: 'poo', label: 'Caca', color: 'amber' },
    { value: 'both', label: 'Els dos', color: 'orange' },
    { value: 'dry', label: 'Sec', color: 'stone' },
  ]

  return (
    <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-sm border border-stone-200/80 mb-20 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/mi-aula/alumnos')}
          className="h-10 w-10 rounded-full hover:bg-stone-100 -ml-2 shrink-0 cursor-pointer text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-stone-900 leading-tight truncate">
            {studentName}
          </h2>
          <p className="text-xs font-semibold text-stone-400 capitalize">
            Agenda del {new Date(dateStr).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Mood Section */}
        {settings.agenda_mood !== false && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-teal-700">
            <Smile className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">Estat d&apos;ànim</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'happy', label: 'Feliç' },
              { id: 'calm', label: 'Tranquil' },
              { id: 'sad', label: 'Trist' },
              { id: 'irritable', label: 'Irritable' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-[20px] transition-all cursor-pointer border-2 ${
                  mood === m.id 
                    ? 'border-teal-500 bg-teal-50 shadow-sm scale-105' 
                    : 'border-stone-100 bg-white hover:border-teal-200 hover:bg-stone-50'
                }`}
              >
                <span className={`text-xs font-bold ${mood === m.id ? 'text-teal-700' : 'text-stone-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>
        )}

        {/* Meals Section */}
        {settings.agenda_food !== false && (
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-orange-600">
            <Utensils className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">Alimentació</h3>
          </div>
          
          <div className="space-y-3">
            <div className="bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
              <label className="text-xs font-bold text-stone-600 mb-2 block">Esmorzar</label>
              <div className="flex bg-white rounded-xl overflow-hidden border border-stone-200/80 p-1">
                {mealOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBreakfast(opt.value)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      breakfast === opt.value
                        ? `bg-${opt.color}-50 text-${opt.color}-700 shadow-xs`
                        : 'text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
              <label className="text-xs font-bold text-stone-600 mb-2 block">Dinar</label>
              <div className="flex bg-white rounded-xl overflow-hidden border border-stone-200/80 p-1">
                {mealOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLunch(opt.value)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      lunch === opt.value
                        ? `bg-${opt.color}-50 text-${opt.color}-700 shadow-xs`
                        : 'text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
              <label className="text-xs font-bold text-stone-600 mb-2 block">Berenar</label>
              <div className="flex bg-white rounded-xl overflow-hidden border border-stone-200/80 p-1">
                {mealOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSnack(opt.value)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      snack === opt.value
                        ? `bg-${opt.color}-50 text-${opt.color}-700 shadow-xs`
                        : 'text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Diaper Section */}
        {settings.agenda_diaper !== false && (
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-amber-600">
            <Droplets className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">Control d&apos;esfínters</h3>
          </div>
          
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
              <label className="text-xs font-bold text-stone-600 mb-2 block">Tipus de deposició</label>
              <div className="grid grid-cols-2 gap-1.5">
                {diaperOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDiaperType(opt.value)}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-colors border cursor-pointer ${
                      diaperType === opt.value
                        ? `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-800`
                        : 'bg-white border-stone-200/80 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="col-span-4 bg-stone-50/50 rounded-[20px] p-3 border border-stone-100 flex flex-col justify-between">
              <label className="text-xs font-bold text-stone-600 text-center">Canvis</label>
              <div className="flex items-center justify-between bg-white rounded-xl border border-stone-200/80 p-1">
                <button 
                  onClick={() => setDiaperChanges(Math.max(0, diaperChanges - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 cursor-pointer"
                >-</button>
                <span className="font-black text-sm text-stone-800">{diaperChanges}</span>
                <button 
                  onClick={() => setDiaperChanges(diaperChanges + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 cursor-pointer"
                >+</button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Nap Section */}
        {settings.agenda_nap !== false && (
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <Moon className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">Descans / Siesta</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDidNap(true)}
              className={`flex-1 py-3 rounded-[16px] text-xs font-bold border-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${didNap ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-100 bg-white text-stone-400 hover:border-emerald-200'}`}
            >
              <CheckCircle2 className={`h-4 w-4 ${didNap ? 'text-emerald-500' : 'text-stone-300'}`} /> Ha dormit
            </button>
            <button
              onClick={() => setDidNap(false)}
              className={`flex-1 py-3 rounded-[16px] text-xs font-bold border-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${!didNap ? 'border-red-400 bg-red-50 text-red-800' : 'border-stone-100 bg-white text-stone-400 hover:border-red-200'}`}
            >
              <XCircle className={`h-4 w-4 ${!didNap ? 'text-red-400' : 'text-stone-300'}`} /> No ha dormit
            </button>
          </div>

          {didNap && (
            <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
              <div className="flex-1 bg-stone-50 rounded-2xl p-2 border border-stone-100">
                <label className="text-[10px] font-bold text-stone-500 block mb-1 px-1">Inici</label>
                <input 
                  type="time" 
                  value={napStart}
                  onChange={(e) => setNapStart(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="text-stone-300 font-bold">-</div>
              <div className="flex-1 bg-stone-50 rounded-2xl p-2 border border-stone-100">
                <label className="text-[10px] font-bold text-stone-500 block mb-1 px-1">Fi</label>
                <input 
                  type="time" 
                  value={napEnd}
                  onChange={(e) => setNapEnd(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}
        </section>
        )}

        {/* Notes & Photos */}
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Escriu una nota per a la família... (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 bg-stone-50 border border-stone-200/80 rounded-[20px] p-4 text-sm font-medium text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer">
                <Camera className="h-4 w-4" /> Fer foto
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer">
                <ImageIcon className="h-4 w-4" /> Galeria
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-safe">
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl bg-[#0f766e] hover:bg-[#0d665f] text-white font-black text-sm shadow-xl shadow-[#0f766e]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Desar Agenda'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
