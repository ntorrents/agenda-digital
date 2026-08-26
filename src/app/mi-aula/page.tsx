'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Camera, Utensils, ChevronRight } from 'lucide-react'
import { DateSelector } from '@/components/shared/DateSelector'

export default function ClassroomSummaryPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Simulated logic to show empty state if date is in the future
  const isFuture = selectedDate.getTime() > new Date().setHours(0,0,0,0)

  return (
    <main className="px-4 sm:px-6 pt-2 pb-8 space-y-4">
      
      {/* Selector de Fecha */}
      <DateSelector 
        selectedDate={selectedDate} 
        onChange={setSelectedDate} 
        className="mb-4 max-w-2xl"
      />

      {isFuture ? (
        <div className="rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-xs">
          <h3 className="text-sm font-bold text-stone-800">Dia no disponible</h3>
          <p className="text-xs text-stone-500 mt-1">No es poden registrar dades en el futur.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Quick Classroom Status Bar */}
          <div className="flex items-center justify-between p-4.5 rounded-[24px] bg-white border border-stone-200/80 shadow-xs cursor-pointer hover:border-orange-200 transition-all active:scale-[0.99]" onClick={() => router.push('/mi-aula/alumnos')}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">Assistència</p>
                <p className="text-xs text-stone-400">3 de 3 infants presents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3 py-1 rounded-full font-bold hidden sm:inline-flex">
                Tots presents
              </span>
              <ChevronRight className="h-5 w-5 text-stone-400" />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              <Camera className="h-5 w-5 text-teal-700" />
              <span>Foto grupal</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              <Utensils className="h-5 w-5 text-orange-500" />
              <span>Menú del dia</span>
            </button>
          </div>

          {/* Pending Tasks */}
          <div className="pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2 px-1">
              Tasques pendents
            </h2>
            <div className="rounded-[24px] border border-orange-200/80 bg-orange-50/50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-800">Agenda de Leo Martín</p>
                  <p className="text-xs text-stone-500">Encara no has introduït les dades d&apos;avui.</p>
                </div>
                <button 
                  onClick={() => router.push('/mi-aula/alumnos/66666666-6666-6666-6666-666666666663')}
                  className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer"
                >
                  Completar
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  )
}
