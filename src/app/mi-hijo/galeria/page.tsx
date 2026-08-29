import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon, Download, Calendar } from 'lucide-react'
import Image from 'next/image'

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Get student and classroom info
  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  if (!guardianRel?.student_id) {
    return <div>No s'ha trobat l'alumne associat.</div>
  }

  const { data: student } = await supabase
    .from('students')
    .select('classroom_id')
    .eq('id', guardianRel.student_id)
    .single()

  // 2. Fetch individual photos
  const { data: logsWithPhotos } = await supabase
    .from('daily_logs')
    .select('date, photo_url')
    .eq('student_id', guardianRel.student_id)
    .not('photo_url', 'is', null)
    .order('date', { ascending: false })

  // 3. Fetch global photos (if applicable)
  let classroomPhotos: any[] = []
  if (student?.classroom_id) {
    const { data: classNotes } = await supabase
      .from('classroom_daily_notes')
      .select('date, photo_url')
      .eq('classroom_id', student.classroom_id)
      .not('photo_url', 'is', null)
      .order('date', { ascending: false })
    
    if (classNotes) {
      classroomPhotos = classNotes
    }
  }

  // 4. Combine and sort
  const allPhotos = [
    ...(logsWithPhotos || []).map(p => ({ ...p, type: 'individual' })),
    ...classroomPhotos.map(p => ({ ...p, type: 'groupal' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white p-5 rounded-[24px] border border-stone-200/60 shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">Galeria de Fotos</h2>
          <p className="text-sm font-medium text-stone-500">Tots els records guardats</p>
        </div>
      </div>

      {allPhotos.length === 0 ? (
        <div className="text-center p-8 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-stone-500 font-medium">Encara no hi ha fotos a la galeria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allPhotos.map((photo, index) => (
            <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60">
              <Image 
                src={photo.photo_url} 
                alt={`Foto del ${photo.date}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-white" />
                <span className="text-[10px] font-bold text-white tracking-wider">
                  {new Date(photo.date).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="absolute top-2 right-2">
                <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-sm ${
                  photo.type === 'individual' ? 'bg-white/90 text-stone-700' : 'bg-emerald-500/90 text-white'
                }`}>
                  {photo.type === 'individual' ? 'Individual' : 'Grup'}
                </span>
              </div>
              
              <a 
                href={photo.photo_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
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
