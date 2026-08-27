import { Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FamilyGalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let photos: { id: string; url: string; date: string; desc: string }[] = []

  if (guardianRel) {
    const studentId = guardianRel.student_id

    const { data: logsWithPhotos } = await supabase
      .from('daily_logs')
      .select('id, date, photos, notes')
      .eq('student_id', studentId)
      .not('photos', 'eq', '{}')
      .order('date', { ascending: false })

    if (logsWithPhotos) {
      logsWithPhotos.forEach(log => {
        if (log.photos && Array.isArray(log.photos)) {
          log.photos.forEach((url: string, index: number) => {
            photos.push({
              id: `${log.id}-${index}`,
              url: url,
              date: new Date(log.date).toLocaleDateString('ca-ES'),
              desc: log.notes ? log.notes.substring(0, 50) + '...' : 'Foto del dia'
            })
          })
        }
      })
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ImageIcon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Galeria de fotos</h2>
      </div>

      <div className="space-y-4">
        {photos.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-8">Encara no hi ha fotos.</p>
        )}

        {photos.map((photo) => (
          <div key={photo.id} className="rounded-[28px] border border-stone-200/80 bg-white p-3 shadow-xs overflow-hidden">
            <div className="aspect-4/3 w-full overflow-hidden rounded-[20px] bg-stone-100 relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.desc}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md text-white text-xs font-semibold">
                  {photo.desc}
                </div>
                <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold">
                  {photo.date}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
