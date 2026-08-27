import { Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FamilyCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let logs: any[] = []
  
  if (guardianRel) {
    const studentId = guardianRel.student_id
    
    // Fetch logs for the current month roughly
    // In a full implementation we would take year/month from searchParams
    const { data } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('student_id', studentId)

    logs = data || []
  }

  // Set of dates the student attended
  const attendedDates = new Set(logs.map(l => l.date))

  const selectedMonth = 'Agost 2026'
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const today = new Date()
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

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
            const dateStr = `2026-08-${String(day).padStart(2,'0')}`
            const isToday = dateStr === todayDateStr
            const isPresent = attendedDates.has(dateStr)
            
            // Assume weekends are 1, 2, 8, 9, 15, 16, 22, 23, 29, 30 for Aug 2026
            const isWeekend = [1, 2, 8, 9, 15, 16, 22, 23, 29, 30].includes(day)
            
            // If it's not a weekend, and we have no log, and it's in the past (before today) -> absent
            const isPast = day < today.getDate() && today.getMonth() === 7 // August
            const isAbsent = !isPresent && !isWeekend && isPast

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
