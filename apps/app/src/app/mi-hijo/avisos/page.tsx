import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Pin, Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function TaulerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('notices')

  // Get student's classroom to fetch relevant announcements
  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .maybeSingle()

  let classroomId = null
  if (guardianRel?.student_id) {
    const { data: student } = await supabase
      .from('students')
      .select('classroom_id')
      .eq('id', guardianRel.student_id)
      .maybeSingle()
    classroomId = student?.classroom_id
  }

  // Fetch announcements for school or classroom
  const query = supabase
    .from('events_announcements')
    .select('*')
    .eq('event_type', 'announcement')
    .neq('title', 'NOTAGLOBAL')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (classroomId) {
    // We want announcements that are audience='school' OR (audience='classroom' AND classroom_id = child's classroom)
    query.or(`audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${classroomId})`)
  } else {
    query.eq('audience', 'school')
  }

  const { data: announcements } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white p-5 rounded-[24px] border border-stone-200/60 shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <Bell className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">{t('title')}</h2>
          <p className="text-sm font-medium text-stone-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {!announcements || announcements.length === 0 ? (
          <div className="text-center p-8 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-stone-500 font-medium">{t('noNotices')}</p>
          </div>
        ) : (
          announcements.map(announcement => (
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
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                    announcement.audience === 'school' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {announcement.audience === 'school' ? t('general') : t('classroom')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-400 font-medium">
                    <Clock className="h-3 w-3" />
                    {new Date(announcement.created_at).toLocaleDateString('ca-ES')}
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
    </div>
  )
}
