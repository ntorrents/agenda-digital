import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ClassroomFormModal } from '@/components/admin/ClassroomFormModal'

export default async function DashboardAulasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  const schoolId = profile.school_id

  // Fetch all classrooms with their teachers
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select(`
      id,
      name,
      level,
      teacher:profiles!teacher_id(full_name)
    `)
    .eq('school_id', schoolId)
    .order('name')

  // Fetch all students to count per classroom
  const { data: students } = await supabase
    .from('students')
    .select('classroom_id')
    .eq('school_id', schoolId)

  // Fetch today's logs to count attendance
  const todayDateStr = new Date().toISOString().split('T')[0]
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('classroom_id')
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)

  // Fetch teachers for the dropdown
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Aules del Centre</h3>
          <p className="text-xs text-stone-400">Seguiment per grups d&apos;edat</p>
        </div>
        
        <ClassroomFormModal teachers={teachers || []} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {classrooms?.map(classroom => {
          const studentCount = students?.filter(s => s.classroom_id === classroom.id).length || 0
          const presentCount = logs?.filter(l => l.classroom_id === classroom.id).length || 0
          const levelColor = classroom.level === 'I1' ? 'teal' : classroom.level === 'I2' ? 'orange' : 'amber'
          
          return (
            <Link 
              key={classroom.id}
              href="/mi-aula" // In the future, admin might be able to visit as the teacher
              className={`rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs hover:border-${levelColor}-500 hover:shadow-lg transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-base font-bold text-stone-900 group-hover:text-${levelColor}-700 transition-colors`}>
                      Aula {classroom.name}
                    </h4>
                    <span className={`bg-${levelColor}-50 text-${levelColor}-800 border border-${levelColor}-200/80 rounded-full text-[10px] font-bold px-2.5 py-0.5`}>
                      {classroom.level}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Educadora: 
                    {classroom.teacher ? (
                      <strong className="text-stone-700 ml-1">{classroom.teacher.full_name}</strong>
                    ) : (
                      <span className="text-stone-400 italic ml-1">Pendent d&apos;assignar</span>
                    )}
                  </p>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-${levelColor}-700 group-hover:text-white transition-all shrink-0`}>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
                <span>{studentCount} alumnes inscrits</span>
                {presentCount > 0 ? (
                  <span className="font-bold text-emerald-600">{presentCount} presents avui</span>
                ) : (
                  <span className="text-stone-400">Cap registre avui</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
