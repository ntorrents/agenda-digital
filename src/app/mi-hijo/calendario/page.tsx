import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

// Utility function to generate calendar days
function getLocalISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1)
  const days = []
  
  // Backfill to Monday (assuming Monday is start of week)
  let dayOfWeek = date.getDay() - 1
  if (dayOfWeek === -1) dayOfWeek = 6 // Sunday
  
  for (let i = 0; i < dayOfWeek; i++) {
    const prevDate = new Date(year, month, -dayOfWeek + i + 1)
    days.push({ date: prevDate, isCurrentMonth: false })
  }

  while (date.getMonth() === month) {
    days.push({ date: new Date(date), isCurrentMonth: true })
    date.setDate(date.getDate() + 1)
  }

  // Forward fill to Sunday
  let nextMonthDay = 1
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(year, month + 1, nextMonthDay++), isCurrentMonth: false })
  }

  return days
}

export default async function MonthlyCalendarPage(props: { searchParams: Promise<{ month?: string, selected?: string }> }) {
  const searchParams = await props.searchParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  if (!guardianRel) redirect('/login')
  const studentId = guardianRel.student_id

  // Date parsing
  const today = new Date()
  today.setHours(0,0,0,0)
  
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-')
    if (y && m) currentMonth = new Date(parseInt(y), parseInt(m) - 1, 1)
  }

  const selectedDateStr = searchParams.selected || getLocalISODate(today)
  const selectedDate = new Date(selectedDateStr)
  selectedDate.setHours(0,0,0,0)

  // Navigation Links
  const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}`
  const nextMonthStr = `${nextMonthDate.getFullYear()}-${(nextMonthDate.getMonth() + 1).toString().padStart(2, '0')}`

  // Fetch logs for the whole month to show dots/status
  const monthStartStr = getLocalISODate(currentMonth)
  const nextMonthStartStr = getLocalISODate(nextMonthDate)

  const { data: monthLogs } = await supabase
    .from('daily_logs')
    .select('date, attendance')
    .eq('student_id', studentId)
    .gte('date', monthStartStr)
    .lt('date', nextMonthStartStr)

  // Fetch log for the specifically selected date
  const { data: selectedLog } = await supabase
    .from('daily_logs')
    .select('*, teacher:profiles!teacher_id(full_name)')
    .eq('student_id', studentId)
    .eq('date', selectedDateStr)
    .maybeSingle()

  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  const weekDays = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

  // Month formatter
  const monthName = currentMonth.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })
  const selectedDateFormatted = selectedDate.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="max-w-md mx-auto pt-6 pb-12 px-4 space-y-6">
      
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-purple-600" /> Calendari
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Visió mensual i resum diari.
        </p>
      </div>

      {/* Calendar Card */}
      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs">
        
        {/* Header (Prev / Month / Next) */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href={`/mi-hijo/calendario?month=${prevMonthStr}&selected=${selectedDateStr}`}
            replace={true}
            scroll={false}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h3 className="font-bold text-stone-800 capitalize">{monthName}</h3>
          <Link 
            href={`/mi-hijo/calendario?month=${nextMonthStr}&selected=${selectedDateStr}`}
            replace={true}
            scroll={false}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 active:scale-95 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {weekDays.map(wd => (
            <div key={wd} className="text-[10px] font-black text-stone-400 uppercase">{wd}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dateStr = getLocalISODate(day.date)
            const isSelected = dateStr === selectedDateStr
            const isToday = day.date.getTime() === today.getTime()
            
            // Find log for this day
            const dayLog = monthLogs?.find(l => l.date === dateStr)
            
            return (
              <Link 
                key={idx}
                href={`/mi-hijo/calendario?month=${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}&selected=${dateStr}`}
                replace={true}
                scroll={false}
                className={`
                  relative flex flex-col items-center justify-center h-12 w-full rounded-2xl transition-all cursor-pointer active:scale-95
                  ${isSelected ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black' : 
                    day.isCurrentMonth ? 'bg-stone-50 text-stone-800 font-bold hover:bg-stone-100' : 'bg-transparent text-stone-300 font-medium'}
                  ${isToday && !isSelected ? 'border border-purple-300' : ''}
                `}
              >
                <span>{day.date.getDate()}</span>
                {/* Indicator Dot */}
                {dayLog && (
                  <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Resumen del Día Seleccionado */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-stone-900 capitalize px-2">{selectedDateFormatted}</h3>
        
        {!selectedLog ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[24px] p-6 text-center shadow-xs flex flex-col items-center justify-center gap-2 text-stone-500">
            <Clock className="h-6 w-6 text-stone-400" />
            <p className="text-xs font-medium">No hi ha dades per a aquest dia.</p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
            
            {/* Asistencia */}
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] shadow-sm bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Assistència</p>
                <p className="text-sm font-black text-stone-900">
                  Ha assistit a classe
                </p>
              </div>
            </div>

            {/* Nota */}
            {selectedLog.notes && (
              <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 space-y-2">
                <p className="text-[11px] font-black uppercase text-orange-600/70 tracking-wider">
                  Nota Especial
                </p>
                {selectedLog.notes.split('\n\nNota General: ')[0].trim() && (
                  <p className="text-sm font-semibold text-stone-800 leading-relaxed italic">
                    "{selectedLog.notes.split('\n\nNota General: ')[0].trim()}"
                  </p>
                )}
                {selectedLog.notes.includes('\n\nNota General: ') && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Nota General de l'Aula</p>
                    <p className="text-sm font-medium text-stone-700 italic">
                      "{selectedLog.notes.split('\n\nNota General: ')[1].trim()}"
                    </p>
                  </div>
                )}
                <p className="text-[10px] font-bold text-stone-500 mt-2">
                  — {selectedLog.teacher?.full_name || 'Educadora'}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link 
                href={`/mi-hijo/agenda?date=${selectedDateStr}`}
                className="w-full flex items-center justify-center h-12 rounded-[20px] bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 active:scale-95 transition-all shadow-md"
              >
                Veure Agenda Completa
              </Link>
            </div>
          </div>
        )}
      </div>

    </main>
  )
}
