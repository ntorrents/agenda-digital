import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, CheckCircle2, Users } from 'lucide-react'

export default async function EducatorCalendarPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, capacity')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) return <div>No tens aula assignada</div>

  // Generate calendar days for the current month
  const targetDate = searchParams?.date ? new Date(searchParams.date) : new Date()
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // Get all logs for this month for this classroom
  const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth.getDate()).padStart(2, '0')}`

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('date')
    .eq('classroom_id', classroom.id)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

  // Group by date to count attendance
  const attendanceCount: Record<string, number> = {}
  logs?.forEach(log => {
    attendanceCount[log.date] = (attendanceCount[log.date] || 0) + 1
  })

  // Get total students enrolled to calculate absentees
  const { count: totalStudents } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('classroom_id', classroom.id)

  const studentCount = totalStudents || 0

  // Build calendar grid
  const startingDay = firstDayOfMonth.getDay() // 0 = Sunday
  const offset = startingDay === 0 ? 6 : startingDay - 1 // Make Monday = 0
  
  const days = []
  for (let i = 0; i < offset; i++) {
    days.push(null)
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(i)
  }

  const monthName = new Intl.DateTimeFormat('ca-ES', { month: 'long', year: 'numeric' }).format(firstDayOfMonth)

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900 capitalize">{monthName}</h2>
            <p className="text-xs text-stone-500 font-medium">Resum mensual d&apos;assistència</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[28px] border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50/50">
          {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase text-stone-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 p-2 gap-1 sm:gap-2">
          {days.map((dayNum, i) => {
            if (!dayNum) return <div key={`empty-${i}`} className="h-16 sm:h-20" />
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const present = attendanceCount[dateStr] || 0
            const isWeekend = i % 7 === 5 || i % 7 === 6
            const hasData = present > 0

            return (
              <div 
                key={dateStr} 
                className={`relative flex flex-col items-center justify-center h-16 sm:h-20 rounded-[16px] border ${
                  isWeekend ? 'bg-stone-50/50 border-transparent text-stone-300' : 
                  hasData ? 'bg-white border-stone-200 shadow-sm' : 'bg-white border-dashed border-stone-200 text-stone-400'
                }`}
              >
                <span className={`text-sm font-black ${isWeekend ? 'text-stone-300' : 'text-stone-700'}`}>
                  {dayNum}
                </span>
                
                {hasData && !isWeekend && (
                  <div className="mt-1 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5" /> {present}/{studentCount}
                    </span>
                    {studentCount - present > 0 && (
                      <span className="text-[9px] font-semibold text-red-500">
                        {studentCount - present} absents
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
