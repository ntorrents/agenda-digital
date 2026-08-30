import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon, Download, Calendar, Users } from 'lucide-react'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function DashboardGaleriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const t = await getTranslations('dashboardGaleria')
  const locale = await getLocale()

  let allPhotos = []

  // 1. Fetch classroom_daily_notes photos (Grupal)
  let classNotesQuery = supabase
    .from('classroom_daily_notes')
    .select('date, photo_url, classrooms(name)')
    .eq('school_id', profile.school_id)
    .not('photo_url', 'is', null)

  if (profile.role === 'teacher') {
    classNotesQuery.eq('teacher_id', user.id)
  }

  const { data: classNotes } = await classNotesQuery

  // 2. Fetch daily_logs photos (Individual)
  let dailyLogsQuery = supabase
    .from('daily_logs')
    .select('date, photo_url, students(first_name, last_name, classrooms!inner(name))')
    .not('photo_url', 'is', null)
  
  if (profile.role === 'teacher') {
    dailyLogsQuery.eq('teacher_id', user.id)
  }

  const { data: dailyLogs } = await dailyLogsQuery

  // 3. Combine, tag and sort
  const combinedPhotos = [
    ...(classNotes || []).map((p: any) => ({
      date: p.date,
      photo_url: p.photo_url,
      type: t('typeGroup'),
      context: p.classrooms?.name || t('classroomFallback')
    })),
    ...(dailyLogs || []).map((p: any) => ({
      date: p.date,
      photo_url: p.photo_url,
      type: t('typeIndividual'),
      context: `${p.students?.first_name} ${p.students?.last_name?.charAt(0) || ''}. - ${p.students?.classrooms?.name || t('classroomFallback')}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US'
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
          <ImageIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">{t('title')}</h2>
          <p className="text-stone-500 font-medium text-sm mt-0.5">{t('desc')}</p>
        </div>
      </div>

      {/* Grid */}
      {combinedPhotos.length === 0 ? (
        <div className="bg-white border border-stone-200/60 rounded-[32px] p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-400 mb-4">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">{t('emptyTitle')}</h3>
          <p className="text-stone-500 mt-2">{t('emptyDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {combinedPhotos.map((photo, index) => (
            <div key={index} className="group relative aspect-square rounded-[24px] overflow-hidden bg-stone-100 border border-stone-200 shadow-sm hover:shadow-md transition-all">
              <Image 
                src={photo.photo_url} 
                alt={`Foto`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-80 transition-opacity duration-300"></div>
              
              {/* Type Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md ${
                  photo.type === t('typeIndividual') 
                    ? 'bg-white/90 text-stone-700' 
                    : 'bg-emerald-500/90 text-white'
                }`}>
                  {photo.type}
                </span>
              </div>
              
              {/* Info Bottom */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold truncate">
                    {photo.context}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold tracking-wider">
                    {new Date(photo.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <a 
                href={photo.photo_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
              >
                <Download className="h-4 w-4 text-white" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
