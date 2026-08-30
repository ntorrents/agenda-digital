import { createClient } from '@/lib/supabase/server'
import { Baby, CheckCircle2, AlertCircle, Building2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { getTeacherClassroom } from '@/lib/teacher-classroom'
import { firstName } from '@/lib/roles'
import { getTranslations, getLocale } from 'next-intl/server'

export async function TeacherDashboard({
  userId,
  userName,
}: {
  schoolId: string
  userId: string
  userName: string | null
}) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const t = await getTranslations('dashboardTeacher')
  const locale = await getLocale()

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US',
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const classroom = profile
    ? await getTeacherClassroom(supabase, userId, profile.role)
    : null

  let totalStudents = 0
  let agendasCompleted = 0

  if (classroom) {
    const { count: studentCount } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id)
      .eq('status', 'active')

    totalStudents = studentCount || 0

    const { data: studentIds } = await supabase
      .from('students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('status', 'active')

    const ids = studentIds?.map((s) => s.id) || []
    if (ids.length > 0) {
      const { count: agendasCount } = await supabase
        .from('daily_logs')
        .select('id', { count: 'exact', head: true })
        .eq('date', today)
        .in('student_id', ids)

      agendasCompleted = agendasCount || 0
    }
  }

  const allAgendasDone = totalStudents > 0 && agendasCompleted >= totalStudents
  const agendasPending = Math.max(0, totalStudents - agendasCompleted)
  const displayName = firstName(userName) || userName || ''

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-100 text-xs font-semibold capitalize">
              {new Date().toLocaleDateString(dateLocale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('welcomeName', { name: displayName })}
            </h2>
            <p className="text-sm text-indigo-100/90 font-medium max-w-lg">{t('welcomeDesc')}</p>
          </div>
        </div>
      </div>

      {!classroom ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-bold">{t('noClassroomTitle')}</h3>
            <p className="text-sm mt-1">{t('noClassroomDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-stone-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">{t('yourClassroom')}</p>
                <h3 className="text-2xl font-black text-stone-900">{classroom.name}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-stone-600">
                  <Baby className="h-5 w-5 text-indigo-500" />
                  <span>{t('activeStudents', { count: totalStudents })}</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Link
              href="/dashboard/config/alumnos"
              className="mt-6 flex items-center justify-center w-full bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 rounded-xl border border-stone-200 transition-colors"
            >
              {t('viewStudents')}
            </Link>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">{t('agendaStatus')}</p>
                <h3 className="text-2xl font-black text-stone-900">
                  {agendasCompleted} / {totalStudents}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                  {allAgendasDone ? (
                    <span className="text-teal-600 flex items-center gap-1">
                      <CheckCircle2 className="h-5 w-5" /> {t('allDone')}
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-5 w-5" /> {t('pending', { count: agendasPending })}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Link
              href="/dashboard/agendas"
              className="mt-6 flex items-center justify-center w-full bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 rounded-xl border border-stone-200 transition-colors"
            >
              {t('fillAgendas')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
