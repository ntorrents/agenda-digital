import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'

export default async function CalendariPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get student's classroom to fetch relevant events
  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let classroomId = null
  if (guardianRel?.student_id) {
    const { data: student } = await supabase
      .from('students')
      .select('classroom_id')
      .eq('id', guardianRel.student_id)
      .single()
    classroomId = student?.classroom_id
  }

  // Fetch upcoming events for school or classroom
  const query = supabase
    .from('events_announcements')
    .select('*')
    .eq('event_type', 'event')
    .gte('event_date', new Date().toISOString().split('T')[0]) // Only future or today
    .order('event_date', { ascending: true })

  if (classroomId) {
    query.or(`audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${classroomId})`)
  } else {
    query.eq('audience', 'school')
  }

  const { data: events } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white p-5 rounded-[24px] border border-stone-200/60 shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <CalendarIcon className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">Calendari</h2>
          <p className="text-sm font-medium text-stone-500">Esdeveniments, festius i menú mensual</p>
        </div>
      </div>

      <div className="space-y-4">
        {!events || events.length === 0 ? (
          <div className="text-center p-8 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-stone-500 font-medium">No hi ha cap esdeveniment pròxim.</p>
          </div>
        ) : (
          events.map(event => (
            <div 
              key={event.id} 
              className="p-5 rounded-[24px] bg-white border border-stone-200/60 shadow-xs flex items-start gap-4"
            >
              <div className="flex flex-col items-center justify-center bg-purple-50 border border-purple-100 rounded-2xl p-3 min-w-[70px]">
                <span className="text-xs font-bold text-purple-400 uppercase">
                  {new Date(event.event_date).toLocaleDateString('ca-ES', { month: 'short' })}
                </span>
                <span className="text-2xl font-black text-purple-600 leading-none mt-1">
                  {new Date(event.event_date).getDate()}
                </span>
              </div>
              
              <div className="flex flex-col justify-center flex-1 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                    event.audience === 'school' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {event.audience === 'school' ? 'Festiu / General' : 'Aula'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-800 leading-tight">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    {event.description}
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
