import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon, Calendar } from 'lucide-react'

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch logs with photos
  // Note: we fetch the last 100 logs that have photos.
  const { data: logs } = await supabase
    .from('daily_logs')
    .select(`
      id,
      date,
      photos,
      students (
        first_name,
        last_name,
        classrooms (name)
      )
    `)
    .eq('school_id', profile.school_id)
    .order('date', { ascending: false })
    .limit(300)

  // Filter and group by date
  const logsWithPhotos = (logs || []).filter(log => log.photos && log.photos.length > 0)
  
  const groupedPhotos: Record<string, any[]> = {}
  logsWithPhotos.forEach(log => {
    if (!groupedPhotos[log.date]) {
      groupedPhotos[log.date] = []
    }
    groupedPhotos[log.date].push(log)
  })

  const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 shadow-sm">
          <ImageIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-800">Galeria del Centre</h1>
          <p className="text-sm text-stone-500 font-medium">Totes les fotos penjades per l'equip a les agendes.</p>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-stone-300" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">No hi ha fotos encara</h3>
          <p className="text-stone-500 mt-1 text-sm">Les fotos que pugin les educadores a les agendes apareixeran aquí.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((dateStr) => {
            const dateObj = new Date(dateStr)
            const formattedDate = dateObj.toLocaleDateString('ca-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })

            const dayLogs = groupedPhotos[dateStr]
            
            // Extract all individual photos with their student context for masonry
            const flatPhotos: { url: string, student: any, logId: string }[] = []
            dayLogs.forEach(log => {
              log.photos.forEach((url: string) => {
                flatPhotos.push({
                  url,
                  student: log.students,
                  logId: log.id
                })
              })
            })

            return (
              <section key={dateStr} className="space-y-4">
                <div className="sticky top-20 z-10 flex items-center gap-2 bg-[#faf8f5]/90 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <h2 className="text-lg font-black text-stone-800 capitalize">{formattedDate}</h2>
                  <span className="ml-2 text-xs font-bold text-stone-400 bg-stone-200/50 px-2 py-0.5 rounded-md">
                    {flatPhotos.length} fotos
                  </span>
                </div>
                
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                  {flatPhotos.map((photo, i) => (
                    <div key={`${photo.logId}-${i}`} className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm border border-stone-200/50 bg-white">
                      <img 
                        src={photo.url} 
                        alt="Foto agenda" 
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <p className="text-white font-bold text-sm truncate shadow-sm">
                          {photo.student?.first_name} {photo.student?.last_name}
                        </p>
                        <p className="text-teal-200 font-medium text-xs uppercase tracking-wider truncate">
                          {Array.isArray(photo.student?.classrooms) 
                            ? photo.student?.classrooms[0]?.name 
                            : photo.student?.classrooms?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
