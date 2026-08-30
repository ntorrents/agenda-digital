import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Baby, ChevronRight } from 'lucide-react'
import { BulkActionsWidget } from '@/components/agenda/BulkActionsWidget'
import { AgendaFilters } from '@/components/agenda/AgendaFilters'
import { getTeacherClassroom } from '@/lib/teacher-classroom'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function AgendasIndexPage(props: { searchParams: Promise<{ date?: string, classroom_id?: string }> }) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]
  const queryClassroomId = searchParams.classroom_id
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('dashboardAgendas')
  const locale = await getLocale()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get all classrooms for the school
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, level, teacher_id, school_id')
    .eq('school_id', profile.school_id)
    .order('name', { ascending: true })

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="p-8 text-center bg-amber-50 rounded-2xl m-6">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-3" />
        <p className="font-bold text-amber-800">{t('noClassroom')}</p>
      </div>
    )
  }

  // Determine the active classroom
  let classroom = queryClassroomId ? classrooms.find(c => c.id === queryClassroomId) : null
  
  if (!classroom) {
    if (profile.role === 'teacher' || profile.role === 'auxiliary') {
      const assigned = await getTeacherClassroom(supabase, user.id, profile.role)
      classroom = assigned
        ? classrooms.find((c) => c.id === assigned.id) || classrooms[0]
        : classrooms[0]
    } else {
      classroom = classrooms[0]
    }
  }

  const visibleClassrooms = classrooms

  if (!classroom) {
    return (
      <div className="p-8 text-center bg-amber-50 rounded-2xl m-6">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-3" />
        <p className="font-bold text-amber-800">{t('noClassroom')}</p>
      </div>
    )
  }

  // Get all active students in the classroom
  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name')
    .eq('classroom_id', classroom.id)
    .eq('status', 'active')
    .order('first_name', { ascending: true })

  // Get all logs for today
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('student_id')
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  const loggedStudentIds = new Set(logs?.map(l => l.student_id) || [])

  const pendingStudents = students?.filter(s => !loggedStudentIds.has(s.id)) || []
  const completedStudents = students?.filter(s => loggedStudentIds.has(s.id)) || []

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US'
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'
  const formattedDate = new Date(dateStr).toLocaleDateString(dateLocale)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-800">{t('title')}</h2>
          <p className="text-sm font-medium text-stone-500 mt-1">{t('subtitle', { name: classroom.name, date: formattedDate })}</p>
        </div>
      <div className="flex flex-col gap-3 w-full sm:w-auto sm:items-end">
          <AgendaFilters 
            classrooms={visibleClassrooms}
            currentClassroomId={classroom.id}
            currentDate={dateStr}
          />
          <BulkActionsWidget
            dateStr={dateStr}
            classroomId={classroom.id}
            schoolId={classroom.school_id ?? profile.school_id!}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pending List */}
        <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-stone-800">{t('pending', { count: pendingStudents.length })}</h3>
          </div>
          
          {pendingStudents.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6 bg-stone-50 rounded-xl">{t('noPending')}</p>
          ) : (
            <div className="space-y-2">
              {pendingStudents.map(student => (
                <Link 
                  key={student.id} 
                  href={`/dashboard/agendas/${student.id}?date=${dateStr}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 text-amber-700 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <Baby className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-stone-700">{student.first_name} {student.last_name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Completed List */}
        <div className="bg-white border border-stone-200 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-stone-800">{t('completed', { count: completedStudents.length })}</h3>
          </div>
          
          {completedStudents.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6 bg-stone-50 rounded-xl">{t('noCompleted')}</p>
          ) : (
            <div className="space-y-2">
              {completedStudents.map(student => (
                <Link 
                  key={student.id} 
                  href={`/dashboard/agendas/${student.id}?date=${dateStr}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-700 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <Baby className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-stone-700">{student.first_name} {student.last_name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-600 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
