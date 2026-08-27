import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ImageIcon, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function GaleriaPage() {
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

  // En PostgreSQL y PostgREST `array_length(photos, 1) > 0` o equivalente.
  // Pero Supabase JS no tiene un buen filtro de length de array predeterminado.
  // Nos traemos todo lo que no sea nulo y luego filtramos en JS. (O idealmente con .neq('photos', '{}'))
  const { data: logsWithPhotos } = await supabase
    .from('daily_logs')
    .select('id, date, photos')
    .eq('student_id', guardianRel.student_id)
    .neq('photos', '{}')
    .not('photos', 'is', null)
    .order('date', { ascending: false })

  // Filtrar los que realmente tengan fotos
  const gallery = logsWithPhotos?.filter(log => log.photos && log.photos.length > 0) || []

  return (
    <main className="max-w-md mx-auto pt-6 pb-12 px-4 space-y-6">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-emerald-600" /> Fotos i Galeria
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Reculls fotogràfics del dia a dia.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {gallery.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha fotos encara</h3>
            <p className="text-xs text-stone-500 mt-1">Quan l'escola pugi fotos, apareixeran aquí organitzades per dies.</p>
          </div>
        ) : (
          gallery.map(album => {
            const dateObj = new Date(album.date)
            const dateStr = dateObj.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })

            return (
              <div key={album.id} className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs flex flex-col gap-4">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 capitalize flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-emerald-500" /> {dateStr}
                  </h3>
                  <Link href={`/mi-hijo/agenda?date=${album.date}`} replace={true} scroll={false} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                    Agenda
                  </Link>
                </div>

                {/* Grid de Fotos */}
                <div className="grid grid-cols-2 gap-2">
                  {album.photos.map((photoUrl: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-[20px] overflow-hidden bg-stone-100 border border-stone-200/50">
                      {/* Si photoUrl es un path de Supabase Storage lo ideal es usar supabase.storage.from(...).getPublicUrl(...)
                          Por ahora mostraremos el placeholder o la imagen si es URL externa */}
                      {photoUrl.startsWith('http') ? (
                        <img src={photoUrl} alt={`Foto ${idx + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-stone-300">
                          FOTO
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )
          })
        )}
      </div>

    </main>
  )
}
