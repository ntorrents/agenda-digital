import { Bell, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FamilyNoticesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get guardian's student to find classroom and school
  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let notices = []

  if (guardianRel) {
    const studentId = guardianRel.student_id

    const { data: student } = await supabase
      .from('students')
      .select('school_id, classroom_id')
      .eq('id', studentId)
      .single()

    if (student) {
      // Fetch events/announcements for the school or specific classroom
      const { data: events } = await supabase
        .from('events_announcements')
        .select('*')
        .eq('school_id', student.school_id)
        .or(`audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${student.classroom_id})`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      notices = events || []
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Bell className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Avisos i Esdeveniments</h2>
      </div>

      <div className="space-y-3">
        {notices.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-8">No hi ha avisos recents.</p>
        )}
        
        {notices.map((notice) => (
          <div key={notice.id} className="rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs relative overflow-hidden">
            {notice.is_pinned && (
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500 transform translate-x-6 -translate-y-6 rotate-45 z-0" />
            )}
            
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${notice.event_type === 'event' ? 'bg-teal-50 text-teal-700 ring-4 ring-teal-50/50' : 'bg-amber-50 text-amber-600 ring-4 ring-amber-50/50'}`}>
                {notice.event_type === 'event' ? <Calendar className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">{notice.title}</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {notice.event_date ? new Date(notice.event_date).toLocaleDateString('ca-ES') : new Date(notice.created_at).toLocaleDateString('ca-ES')}
                </p>
              </div>
            </div>
            
            {notice.description && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-medium leading-relaxed relative z-10">
                {notice.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
