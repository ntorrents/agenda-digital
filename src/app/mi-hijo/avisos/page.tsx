import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, ChevronLeft, Calendar as CalendarIcon, Megaphone, AlertCircle, Pin } from 'lucide-react'
import Link from 'next/link'

export default async function AvisosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  if (!guardianRel) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('school_id, classroom_id')
    .eq('id', guardianRel.student_id)
    .single()

  if (!student) redirect('/login')

  // Obtener avisos (school o classroom)
  const { data: events } = await supabase
    .from('events_announcements')
    .select('*')
    .eq('school_id', student.school_id)
    .or(`audience.eq.school,and(audience.eq.classroom,classroom_id.eq.${student.classroom_id})`)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-md mx-auto pt-6 pb-12 px-4 space-y-6">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link 
          href="/mi-hijo"
          className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-500" /> Tauler d'Avisos
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Notícies i esdeveniments del centre.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!events || events.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha avisos</h3>
            <p className="text-xs text-stone-500 mt-1">Ara mateix no hi ha cap comunicat actiu.</p>
          </div>
        ) : (
          events.map(event => {
            const dateObj = new Date(event.created_at)
            const dateStr = dateObj.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })
            
            const isAlert = event.event_type === 'alert'
            const isEvent = event.event_type === 'event'
            
            let badgeColor = "bg-blue-50 text-blue-600 border-blue-100"
            let Icon = Megaphone
            
            if (isAlert) {
              badgeColor = "bg-red-50 text-red-600 border-red-100"
              Icon = AlertCircle
            } else if (isEvent) {
              badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100"
              Icon = CalendarIcon
            }

            return (
              <div key={event.id} className="bg-white border border-stone-200/80 rounded-[24px] p-5 shadow-xs relative">
                
                {event.is_pinned && (
                  <div className="absolute -top-3 -right-2 bg-amber-400 text-white p-2 rounded-full shadow-md transform rotate-12">
                    <Pin className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                    <Icon className="h-3 w-3" /> {event.event_type === 'alert' ? 'Urgent' : event.event_type === 'event' ? 'Esdeveniment' : 'Avís'}
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">{dateStr}</span>
                </div>
                
                <h3 className="text-base font-black text-stone-800 leading-tight mb-2">
                  {event.title}
                </h3>
                
                <p className="text-sm font-medium text-stone-600 leading-relaxed">
                  {event.description}
                </p>

                {event.event_date && (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-stone-500">
                    <CalendarIcon className="h-4 w-4 text-stone-400" />
                    Data esdeveniment: <span className="text-stone-800">{new Date(event.event_date).toLocaleDateString('ca-ES')}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

    </main>
  )
}
