import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Baby, BadgeCheck } from 'lucide-react'
import { StudentFormModal } from '@/components/admin/StudentFormModal'
import { DeleteStudentButton } from '@/components/admin/DeleteStudentButton'

export default async function DashboardAlumnosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch all students and their classrooms
  const { data: students } = await supabase
    .from('students')
    .select(`
      id, 
      first_name, 
      last_name, 
      date_of_birth,
      classroom_id,
      classrooms (
        name,
        level
      )
    `)
    .eq('school_id', profile.school_id)
    .order('first_name', { ascending: true })

  // Fetch all classrooms to populate the assignment dropdown
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, level')
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Alumnes del Centre</h3>
          <p className="text-xs text-stone-400">Llistat global d&apos;alumnes i aules</p>
        </div>
        
        <StudentFormModal classrooms={classrooms || []} />
      </div>

      <div className="space-y-3">
        {students?.map(student => (
          <div 
            key={student.id}
            className="flex items-center justify-between rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 font-black text-lg">
                <Baby className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  {student.first_name} {student.last_name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                  Aula: {student.classrooms ? (Array.isArray(student.classrooms) ? student.classrooms[0]?.name : student.classrooms.name) : 'Sense assignar'}
                </div>
              </div>
            </div>
            <div className="text-right flex items-center justify-end gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-stone-100 text-stone-600">
                {student.classrooms ? (Array.isArray(student.classrooms) ? student.classrooms[0]?.level : student.classrooms.level) : '--'}
              </span>
              <DeleteStudentButton studentId={student.id} />
            </div>
          </div>
        ))}
        {students?.length === 0 && (
          <div className="text-center py-10 text-stone-500 text-sm">
            Encara no hi ha cap alumne registrat.
          </div>
        )}
      </div>
    </main>
  )
}
