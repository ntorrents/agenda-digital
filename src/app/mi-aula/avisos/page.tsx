import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Calendar as CalendarIcon, AlertCircle, Pin, Plus } from 'lucide-react'
import { AvisosForm } from './AvisosForm'
import { DeleteAvisoButton } from './DeleteAvisoButton'

export default async function EducatorAvisosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) return <div>No tens aula assignada</div>

  const { data: events } = await supabase
    .from('events_announcements')
    .select('*')
    .eq('classroom_id', classroom.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className="px-4 sm:px-6 pt-4 pb-12 space-y-6 max-w-2xl mx-auto">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">Tauler de l'Aula</h2>
            <p className="text-xs text-stone-500 font-medium">Gestiona els comunicats per a les famílies</p>
          </div>
        </div>
      </div>

      <AvisosForm />

      <div className="space-y-4 pt-4 border-t border-stone-100">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">Avisos Actius</h3>
        
        {!events || events.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-8 text-center shadow-xs">
             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-stone-300 mb-3 shadow-sm">
               <Megaphone className="h-5 w-5" />
             </div>
             <p className="text-sm font-bold text-stone-500">No hi ha avisos publicats</p>
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
              <div key={event.id} className="bg-white border border-stone-200/80 rounded-[24px] p-5 shadow-xs relative group">
                
                {event.is_pinned && (
                  <div className="absolute -top-3 -right-2 bg-amber-400 text-white p-2 rounded-full shadow-md transform rotate-12">
                    <Pin className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${badgeColor}`}>
                      <Icon className="h-3 w-3" /> {isAlert ? 'Urgent' : isEvent ? 'Esdeveniment' : 'Avís'}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">{dateStr}</span>
                  </div>
                  
                  <DeleteAvisoButton id={event.id} />
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
