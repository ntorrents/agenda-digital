'use client'

import { Image as ImageIcon } from 'lucide-react'

export default function FamilyGalleryPage() {
  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop&q=80', date: 'Avui', desc: "Jugant a l'espai de construccions" },
    { id: 2, url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80', date: 'Ahir', desc: 'Pintant amb els dits' },
    { id: 3, url: 'https://images.unsplash.com/photo-1587691592099-24045742c181?w=800&auto=format&fit=crop&q=80', date: 'Dilluns', desc: 'Hora del pati' },
    { id: 4, url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80', date: 'Divendres passat', desc: 'Festa de final de setmana' },
  ]

  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ImageIcon className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Galeria de fotos</h2>
      </div>

      <div className="space-y-4">
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
