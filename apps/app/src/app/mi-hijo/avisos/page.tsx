import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Pin, Clock } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { getActiveStudentForGuardian } from '@/lib/guardian-students-server'
import { FamilyHelpGuideLink } from '@/components/family/FamilyHelpGuideLink'

const DATE_LOCALES: Record<string, string> = {
  ca: 'ca-ES',
  es: 'es-ES',
  en: 'en-GB',
  fr: 'fr-FR',
}

export default async function TaulerPage(props: {
  searchParams: Promise<{ student?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('notices')
  const locale = await getLocale()
  const dateLocale = DATE_LOCALES[locale] || 'ca-ES'

  const { activeStudentId } = await getActiveStudentForGuardian(
    supabase,
    user.id,
    searchParams.student
  )

  let classroomId = null
  if (activeStudentId) {
    const { data: student } = await supabase
      .from('students')
      .select('classroom_id')
      .eq('id', activeStudentId)
      .maybeSingle()
    classroomId = student?.classroom_id
  }

  const query = supabase
    .from('events_announcements')
    .select('*')
    .eq('event_type', 'announcement')
    .neq('title', 'NOTAGLOBAL')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (classroomId) {
    query.or(
      `audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${classroomId})`
    )
  } else {
    query.eq('audience', 'school')
  }

  const { data: announcements } = await query

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-amber-500" /> {t('title')}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        {!announcements || announcements.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
            <p className="text-stone-500 font-medium">{t('noNotices')}</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-6 rounded-[24px] border shadow-xs relative overflow-hidden ${
                announcement.is_pinned
                  ? 'bg-amber-50/50 border-amber-200/60'
                  : 'bg-white border-stone-200/60'
              }`}
            >
              {announcement.is_pinned && (
                <div className="absolute top-0 right-0 p-4 opacity-50">
                  <Pin className="h-8 w-8 text-amber-400 transform rotate-12" />
                </div>
              )}

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                      announcement.audience === 'school'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {announcement.audience === 'school' ? t('general') : t('classroom')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                    <Clock className="h-3 w-3" />
                    {new Date(announcement.created_at).toLocaleDateString(dateLocale)}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-stone-800 leading-tight">
                  {announcement.title}
                </h3>

                {announcement.description && (
                  <p className="text-sm text-stone-600 mt-1 whitespace-pre-wrap">
                    {announcement.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <FamilyHelpGuideLink />
    </div>
  )
}
