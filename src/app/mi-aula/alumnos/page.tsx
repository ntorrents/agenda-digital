import { Smile, Utensils, Moon, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentsListPage(props: { searchParams: Promise<{ date?: string }> }) {
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
    .select('id')
    .eq('teacher_id', user.id)
    .single()

  let studentsWithLogStatus: any[] = []

  if (classroom) {
    // Get all students in the classroom
    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name, allergies')
      .eq('classroom_id', classroom.id)
      .order('first_name', { ascending: true })

    if (students) {
      // Get all logs for the classroom on the specific date
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('student_id, mood, meal_lunch, nap_start, nap_end')
        .eq('classroom_id', classroom.id)
        .eq('date', dateStr)

      const logMap = new Map(logs?.map(log => [log.student_id, log]))

      studentsWithLogStatus = students.map(student => ({
        ...student,
        log: logMap.get(student.id) || null
      }))
    }
  }

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-wider text-stone-400">
          Alumnes ({studentsWithLogStatus.length})
        </h2>
        <span className="text-xs text-stone-400 font-medium hidden sm:inline">Data: {new Date(dateStr).toLocaleDateString('ca-ES')}</span>
      </div>

      <div className="space-y-3">
        {studentsWithLogStatus.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-8">No hi ha alumnes en aquesta aula.</p>
        )}

        {studentsWithLogStatus.map((student) => (
          <Link
            key={student.id}
            href={`/mi-aula/alumnos/${student.id}?date=${dateStr}`}
            className="block rounded-[24px] border border-stone-200/80 bg-white shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] p-4.5 group"
          >
            <div className="flex items-center justify-between">
              
              {/* Student Info */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100/80 text-teal-800 font-black text-lg shrink-0 group-hover:bg-teal-100 transition-colors">
                  {student.first_name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    {student.first_name} {student.last_name}
                  </h3>
                  {student.allergies ? (
                    <p className="text-[11px] font-bold text-orange-600 mt-0.5">
                      ⚠️ {student.allergies}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Sense al·lèrgies
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badges & Action */}
              <div className="flex items-center gap-2">
                {student.log ? (
                  <div className="flex items-center gap-1 hidden sm:flex">
                    {student.log.mood && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xs ring-2 ring-teal-50/50" title="Estat d'ànim">
                        <Smile className="h-4 w-4" />
                      </span>
                    )}
                    {student.log.meal_lunch && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xs ring-2 ring-orange-50/50" title="Dinar">
                        <Utensils className="h-4 w-4" />
                      </span>
                    )}
                    {student.log.nap_start && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xs ring-2 ring-emerald-50/50" title="Migdiada">
                        <Moon className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] rounded-full px-2.5 py-1 font-bold">
                    Pendent
                  </span>
                )}

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-teal-700 group-hover:text-white shrink-0 ml-2 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
