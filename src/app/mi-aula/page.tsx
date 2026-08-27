import { Users, Camera, Utensils, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ClassroomSummaryPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the teacher's classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('teacher_id', user.id)
    .single()

  let studentCount = 0
  let logsCount = 0
  let firstPendingStudent: any = null

  if (classroom) {
    // Count students
    const { count: sCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id)
      
    studentCount = sCount || 0

    // Count logs for this date
    const { count: lCount } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id)
      .eq('date', dateStr)
      
    logsCount = lCount || 0

    // Find one pending student for the task widget
    if (studentCount > logsCount) {
      // Get all students
      const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('classroom_id', classroom.id)
        
      // Get all logs for today
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('student_id')
        .eq('classroom_id', classroom.id)
        .eq('date', dateStr)
        
      const loggedStudentIds = new Set(logs?.map(l => l.student_id))
      firstPendingStudent = students?.find(s => !loggedStudentIds.has(s.id))
    }
  }

  const selectedDate = new Date(dateStr)
  selectedDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isFuture = selectedDate.getTime() > today.getTime()

  return (
    <main className="px-4 sm:px-6 pt-2 pb-8 space-y-4">
      
      {isFuture ? (
        <div className="rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-xs">
          <h3 className="text-sm font-bold text-stone-800">Dia no disponible</h3>
          <p className="text-xs text-stone-500 mt-1">No es poden registrar dades en el futur.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Quick Classroom Status Bar */}
          <Link href="/mi-aula/alumnos">
            <div className="flex items-center justify-between p-4.5 rounded-[24px] bg-white border border-stone-200/80 shadow-xs cursor-pointer hover:border-orange-200 transition-all active:scale-[0.99] group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Assistència i Agendes</p>
                  <p className="text-xs text-stone-400">{logsCount} de {studentCount} completades</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {logsCount === studentCount && studentCount > 0 ? (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3 py-1 rounded-full font-bold hidden sm:inline-flex">
                    Tot complet
                  </span>
                ) : (
                   <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs px-3 py-1 rounded-full font-bold hidden sm:inline-flex">
                    {studentCount - logsCount} pendents
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-stone-700" />
              </div>
            </div>
          </Link>

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
            {firstPendingStudent ? (
              <div className="rounded-[24px] border border-orange-200/80 bg-orange-50/50 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-800">Agenda de {firstPendingStudent.first_name} {firstPendingStudent.last_name}</p>
                    <p className="text-xs text-stone-500">Encara no has introduït les dades d&apos;avui.</p>
                  </div>
                  <Link 
                    href={`/mi-aula/alumnos/${firstPendingStudent.id}?date=${dateStr}`}
                    className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer"
                  >
                    Completar
                  </Link>
                </div>
              </div>
            ) : (
               <div className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-4 text-center">
                  <p className="text-sm font-bold text-stone-500">No hi ha tasques pendents!</p>
               </div>
            )}
          </div>

        </div>
      )}
    </main>
  )
}
