import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Baby, Filter, Search, Plus, Eye } from 'lucide-react'
import { DeleteStudentButton } from '@/components/admin/DeleteStudentButton'
import Link from 'next/link'
import { getTeacherClassroom } from '@/lib/teacher-classroom'
import { getTranslations } from 'next-intl/server'

export default async function DashboardConfigAlumnosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  let staffClassroomId: string | null = null
  if (profile.role === 'teacher' || profile.role === 'auxiliary') {
    const classroom = await getTeacherClassroom(supabase, user.id, profile.role)
    staffClassroomId = classroom?.id ?? null
  }

  // Build query for students
  let query = supabase
    .from('students')
    .select(`
      *,
      classrooms (
        id,
        name,
        level
      )
    `)
    .eq('school_id', profile.school_id)
    .order('first_name', { ascending: true })

  if (profile.role === 'teacher' || profile.role === 'auxiliary') {
    if (staffClassroomId) {
      query = query.eq('classroom_id', staffClassroomId)
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  const { data: students } = await query

  const t = await getTranslations('dashboardAlumnos')

  const getGenderLabel = (g: string) => {
    switch (g) {
      case 'boy': return t('gender.boy')
      case 'girl': return t('gender.girl')
      case 'other': return t('gender.other')
      default: return t('gender.unknown')
    }
  }

  const getClassroomColor = (level: string) => {
    switch (level) {
      case 'I0': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'I1': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'I2': return 'bg-purple-100 text-purple-800 border border-purple-200'
      default: return 'bg-stone-100 text-stone-800 border border-stone-200'
    }
  }

  // Group students by level
  const levels = ['I0', 'I1', 'I2']
  const studentsByLevel = levels.reduce((acc, level) => {
    acc[level] = students?.filter(s => {
      const c = Array.isArray(s.classrooms) ? s.classrooms[0] : s.classrooms
      return c?.level === level
    }) || []
    return acc
  }, {} as Record<string, any[]>)
  
  // Unassigned students
  const unassigned = students?.filter(s => !s.classrooms) || []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.role === 'admin' && (
            <Link 
              href="/dashboard"
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
          )}
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Baby className="h-5 w-5 text-teal-600" /> {profile.role === 'admin' ? t('titleAdmin') : t('titleTeacher')}
            </h3>
            <p className="text-xs text-stone-500">{profile.role === 'admin' ? t('descAdmin') : t('descTeacher')}</p>
          </div>
        </div>
        
        {profile.role === 'admin' && (
          <Link 
            href="/dashboard/config/alumnos/nuevo"
            className="inline-flex items-center justify-center rounded-2xl bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs h-9 px-4 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> {t('newStudent')}
          </Link>
        )}
      </div>


      {/* Render tables by level */}
      <div className="space-y-8">
        {[...levels, 'Sense Aula'].map(level => {
          if ((profile.role === 'teacher' || profile.role === 'auxiliary') && level === 'Sense Aula') return null
          const list = level === 'Sense Aula' ? unassigned : studentsByLevel[level]
          if (list.length === 0) return null

          return (
            <div key={level} className="space-y-3">
              {profile.role === 'admin' && <h4 className="text-sm font-black text-stone-800 ml-2">{level === 'Sense Aula' ? t('unassignedGroup') : `${t('level')} ${level}`}</h4>}
              <div className="bg-white border border-stone-200/80 rounded-[24px] overflow-hidden shadow-xs">
                {/* Mòbil: targetes */}
                <div className="md:hidden divide-y divide-stone-100">
                  {list.map((student: any) => {
                    const classroom = Array.isArray(student.classrooms) ? student.classrooms[0] : student.classrooms
                    const colorClass = classroom ? getClassroomColor(classroom.level) : 'bg-stone-100 text-stone-800 border-stone-200'

                    return (
                      <div key={student.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-stone-900 text-base leading-tight">
                              {student.first_name} {student.last_name}
                            </p>
                            <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-md max-w-full break-words ${colorClass}`}>
                              {classroom ? `${classroom.name} (${classroom.level})` : t('unassignedCell')}
                            </span>
                          </div>
                          <Link
                            href={`/dashboard/config/alumnos/${student.id}`}
                            className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-2 rounded-xl border border-teal-200/50"
                          >
                            <Eye className="h-3 w-3" /> {t('table.profile')}
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-stone-50 rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold uppercase text-stone-400">{t('table.gender')}</p>
                            <p className="font-semibold text-stone-700 mt-0.5">{getGenderLabel(student.gender)}</p>
                          </div>
                          <div className="bg-stone-50 rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold uppercase text-stone-400">{t('table.birthDate')}</p>
                            <p className="font-semibold text-stone-700 mt-0.5">
                              {new Date(student.date_of_birth).toLocaleDateString('ca-ES')}
                            </p>
                          </div>
                          <div className="col-span-2 bg-stone-50 rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold uppercase text-stone-400">{t('table.intolerances')}</p>
                            <p className="font-semibold mt-0.5">
                              {student.intolerances ? (
                                <span className="text-red-600">{t('table.yes')}</span>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {profile.role === 'admin' && (
                          <div className="pt-1">
                            <DeleteStudentButton studentId={student.id} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Escriptori: taula */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm text-stone-600">
                    <thead className="bg-stone-50/50 text-xs uppercase font-black text-stone-400 border-b border-stone-100">
                      <tr>
                        <th className="px-4 py-3">{t('table.name')}</th>
                        <th className="px-4 py-3">{t('table.classroom')}</th>
                        <th className="px-4 py-3">{t('table.gender')}</th>
                        <th className="px-4 py-3">{t('table.birthDate')}</th>
                        <th className="px-4 py-3">{t('table.intolerances')}</th>
                        <th className="px-4 py-3 text-right">{t('table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {list.map((student: any) => {
                        const classroom = Array.isArray(student.classrooms) ? student.classrooms[0] : student.classrooms
                        const colorClass = classroom ? getClassroomColor(classroom.level) : 'bg-stone-100 text-stone-800 border-stone-200'

                        return (
                          <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-stone-900 whitespace-nowrap">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${colorClass}`}>
                                {classroom ? classroom.name : t('unassignedCell')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold">
                              {getGenderLabel(student.gender)}
                            </td>
                            <td className="px-4 py-3 text-xs text-stone-500">
                              {new Date(student.date_of_birth).toLocaleDateString('ca-ES')}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {student.intolerances ? (
                                <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">{t('table.yes')}</span>
                              ) : (
                                <span className="text-stone-300">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link 
                                  href={`/dashboard/config/alumnos/${student.id}`}
                                  className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-xl transition-colors border border-teal-200/50"
                                >
                                  <Eye className="h-3 w-3" /> {t('table.profile')}
                                </Link>
                                {profile.role === 'admin' && <DeleteStudentButton studentId={student.id} />}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })}
        {students?.length === 0 && (
          <div className="text-center py-12 text-stone-500 text-sm bg-white rounded-[24px] border border-stone-200/80">
            {t('noStudents')}
          </div>
        )}
      </div>
    </div>
  )
}
