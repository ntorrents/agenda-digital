'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react'

export default function FamilyCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState('Agost 2026')
  
  // Dummy data for visual representation
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  
  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Historial i Calendari</h2>
      </div>

      <div className="rounded-[28px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <button className="text-stone-400 hover:text-stone-700 font-bold px-2 py-1">{'<'}</button>
          <span className="font-bold text-stone-800">{selectedMonth}</span>
          <button className="text-stone-400 hover:text-stone-700 font-bold px-2 py-1">{'>'}</button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(d => (
            <div key={d} className="text-[10px] font-bold text-stone-400 uppercase">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {/* Offset for August 2026 starts on Saturday */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {days.map(day => {
            const isToday = day === 27
            const isAbsent = day === 14
            const isPresent = day < 27 && day !== 14 && day > 2 && day < 25 && ![8, 9, 15, 16, 22, 23].includes(day)
            const isWeekend = [1, 2, 8, 9, 15, 16, 22, 23, 29, 30].includes(day)
            
            return (
              <div 
                key={day}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold relative
                  ${isToday ? 'bg-teal-700 text-white shadow-md' : ''}
                  ${isWeekend && !isToday ? 'text-stone-300' : ''}
                  ${!isToday && !isWeekend ? 'bg-stone-50 text-stone-700 hover:bg-stone-100 cursor-pointer' : ''}
                `}
              >
                {day}
                {isPresent && !isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />}
                {isAbsent && !isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />}
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Ha assistit al centre
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <div className="w-2 h-2 rounded-full bg-red-400" /> Absència
          </div>
        </div>
      </div>
    </main>
  )
}
