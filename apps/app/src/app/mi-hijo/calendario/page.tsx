import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getActiveStudentForGuardian } from '@/lib/guardian-students-server'
import { FamilyMonthCalendar } from '@/components/family/FamilyMonthCalendar'

export default async function CalendariPage(props: {
  searchParams: Promise<{ student?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('calendar')

  const { activeStudentId } = await getActiveStudentForGuardian(
    supabase,
    user.id,
    searchParams.student
  )

  let classroomId = null
  let schoolId: string | null = null
  if (activeStudentId) {
    const { data: student } = await supabase
      .from('students')
      .select('classroom_id, school_id')
      .eq('id', activeStudentId)
      .maybeSingle()
    classroomId = student?.classroom_id
    schoolId = student?.school_id || null
  }

  let query = supabase
    .from('events_announcements')
    .select('id, title, description, event_date, audience')
    .eq('event_type', 'event')
    .order('event_date', { ascending: true })

  if (schoolId) {
    query = query.eq('school_id', schoolId)
  }

  if (classroomId) {
    query = query.or(
      `audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${classroomId})`
    )
  } else {
    query = query.eq('audience', 'school')
  }

  const { data: events } = await query

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-purple-600" /> {t('title')}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t('subtitle')}</p>
      </div>

      <FamilyMonthCalendar events={events || []} />
    </div>
  )
}
