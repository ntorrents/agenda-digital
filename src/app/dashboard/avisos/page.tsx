import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Pin, Clock, Megaphone } from 'lucide-react'
import AvisosForm from '@/components/dashboard/AvisosForm'
import { getTranslations } from 'next-intl/server'

export default async function DashboardAvisosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch classrooms for the dropdown
  let classroomsQuery = supabase
    .from('classrooms')
    .select('id, name')
    .eq('school_id', profile.school_id)
    .order('name')

  // If teacher, only fetch their classrooms
  if (profile.role === 'teacher') {
    classroomsQuery = supabase
      .from('classrooms')
      .select('id, name')
      .eq('teacher_id', user.id)
      .order('name')
  }

  const { data: classrooms } = await classroomsQuery

  // Fetch existing announcements
  let announcementsQuery = supabase
    .from('events_announcements')
    .select(`
      id,
      title,
      description,
      audience,
      is_pinned,
      created_at,
      classrooms(name)
    `)
    .eq('school_id', profile.school_id)
    .eq('event_type', 'announcement')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (profile.role === 'teacher' && classrooms && classrooms.length > 0) {
    const classIds = classrooms.map((c: any) => c.id).join(',')
    announcementsQuery.or(`author_id.eq.${user.id},and(audience.eq.classroom,classroom_id.in.(${classIds}))`)
  }

  const { data: announcements } = await announcementsQuery
  const t = await getTranslations('dashboardAvisos')

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-inner">
          <Bell className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">{t('title')}</h2>
          <p className="text-stone-500 font-medium text-sm mt-0.5">{t('desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario para Crear Aviso */}
        <div className="lg:col-span-1">
          <AvisosForm 
            schoolId={profile.school_id} 
            authorId={user.id} 
            role={profile.role} 
            classrooms={classrooms || []} 
          />
        </div>

        {/* Listado de Avisos */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-stone-400" /> {t('history')}
          </h3>
          
          {(!announcements || announcements.length === 0) ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <p className="text-stone-500 font-medium">{t('empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement: any) => (
                <div 
                  key={announcement.id} 
                  className={`bg-white border rounded-[20px] p-5 shadow-xs relative overflow-hidden ${
                    announcement.is_pinned ? 'border-amber-200/60 bg-amber-50/20' : 'border-stone-200'
                  }`}
                >
                  {announcement.is_pinned && (
                    <div className="absolute top-0 right-0 p-4 opacity-30">
                      <Pin className="h-8 w-8 text-amber-400 transform rotate-12" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        announcement.audience === 'school' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {announcement.audience === 'school' ? t('audienceSchool') : t('audienceClassroom', { name: announcement.classrooms?.name || '' })}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-stone-400 font-medium ml-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(announcement.created_at).toLocaleDateString('ca-ES')}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-stone-800 pr-8">{announcement.title}</h4>
                    
                    {announcement.description && (
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">
                        {announcement.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
