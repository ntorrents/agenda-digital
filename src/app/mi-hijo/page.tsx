'use client'

import { useState } from 'react'
import { Utensils, Moon, Droplets, Smile, Calendar, MessageCircle, Sparkles } from 'lucide-react'
import { DateSelector } from '@/components/shared/DateSelector'

export default function FamilyPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Simulated logic to show empty state if date is in the future
  const isFuture = selectedDate.getTime() > new Date().setHours(0,0,0,0)

  return (
    <main className="max-w-md mx-auto pt-2 pb-8 space-y-4">
      
      {/* Selector de Fecha Horizontal */}
      <DateSelector 
        selectedDate={selectedDate} 
        onChange={setSelectedDate} 
      />

      <div className="px-4 space-y-4">
        {isFuture ? (
          <div className="rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha dades</h3>
            <p className="text-xs text-stone-500 mt-1">Aquest dia encara no ha arribat.</p>
          </div>
        ) : (
          <>
            {/* Highlight: Nota del dia de l'Educadora */}
            <div className="rounded-[28px] border border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 p-5 shadow-xs relative overflow-hidden space-y-2.5">
              <div className="flex items-center gap-2 text-teal-800">
                <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">Nota de l&apos;Educadora</span>
              </div>

              <p className="text-sm text-stone-800 font-medium leading-relaxed">
                &ldquo;Avui en Nil ha jugat molt amb les peces de construcció i ha menjat tot el dinar! Ha estat molt feliç i participatiu.&rdquo;
              </p>

              <div className="flex items-center justify-between pt-2.5 border-t border-teal-100 text-xs text-teal-800 font-semibold">
                <span>Clara Soler (Educadora)</span>
                <span className="flex items-center gap-1">
                  <Smile className="h-4 w-4 text-teal-600" /> Content/a
                </span>
              </div>
            </div>

            {/* 3 Pastel Summary Blocks: Food, Nap, Diaper */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* 1. Menjar (Salmón) */}
              <div className="flex flex-col rounded-[24px] bg-orange-50/90 border border-orange-200/80 p-3.5 text-orange-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-200 text-orange-800">
                    <Utensils className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-orange-700">Dinar</span>
                </div>
                <p className="text-base font-black leading-tight">Tot ✅</p>
                <p className="text-[10px] text-orange-700 font-medium mt-1">Esmorzar: Tot</p>
              </div>

              {/* 2. Migdiada (Menta) */}
              <div className="flex flex-col rounded-[24px] bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-emerald-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800">
                    <Moon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-700">Migdiada</span>
                </div>
                <p className="text-base font-black leading-tight">1h 30m</p>
                <p className="text-[10px] text-emerald-700 font-medium mt-1">13:00 - 14:30</p>
              </div>

              {/* 3. Bolquer (Mostaza) */}
              <div className="flex flex-col rounded-[24px] bg-amber-50/90 border border-amber-200/80 p-3.5 text-amber-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
                    <Droplets className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-700">Bolquer</span>
                </div>
                <p className="text-base font-black leading-tight">2 canvis</p>
                <p className="text-[10px] text-amber-700 font-medium mt-1">Pipí + Caca</p>
              </div>

            </div>

            {/* Propers Esdeveniments */}
            <div className="space-y-2 pt-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
                Propers esdeveniments
              </h2>
              <div className="rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">Festa de la Primavera</h3>
                    <p className="text-[11px] text-stone-400">Divendres vinent</p>
                  </div>
                </div>
                <span className="bg-teal-50 text-teal-800 border border-teal-200/80 text-[10px] font-bold rounded-full px-2.5 py-0.5">
                  Tota l&apos;escola
                </span>
              </div>
            </div>

            {/* Botón de Contacto Directo */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full h-12 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-teal-700" />
                <span>Contactar amb l&apos;escola bressol</span>
              </button>
            </div>
          </>
        )}
      </div>

    </main>
  )
}
