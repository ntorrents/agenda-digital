'use client'

import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react'

export default function EducatorCalendarPage() {
  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Planificació i Calendari</h2>
      </div>

      <div className="rounded-[28px] border border-stone-200/80 bg-white p-5 shadow-xs text-center space-y-3">
        <Clock className="h-8 w-8 text-stone-300 mx-auto" />
        <h3 className="text-sm font-bold text-stone-700">En construcció</h3>
        <p className="text-xs text-stone-500">Aquesta secció permetrà planificar menús, excursions i horaris per a tota l&apos;aula.</p>
      </div>
    </main>
  )
}
