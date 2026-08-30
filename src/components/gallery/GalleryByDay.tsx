import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { formatGalleryDayHeader, type GalleryPhoto } from '@/lib/group-photos-by-day'

export function GalleryByDay({
  groups,
  locale,
  photoAltPrefix,
}: {
  groups: { date: string; photos: GalleryPhoto[] }[]
  locale: string
  photoAltPrefix: string
}) {
  return (
    <div className="space-y-10">
      {groups.map(({ date, photos }) => (
        <section key={date} className="space-y-4">
          <h3 className="text-sm font-black text-stone-700 capitalize flex items-center gap-2 px-1">
            <Calendar className="h-4 w-4 text-teal-600" />
            {formatGalleryDayHeader(date, locale)}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={`${photo.url}-${index}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={photo.url}
                  alt={`${photoAltPrefix} ${date}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-sm ${
                      photo.type === 'individual'
                        ? 'bg-white/90 text-stone-700'
                        : 'bg-emerald-500/90 text-white'
                    }`}
                  >
                    {photo.typeLabel}
                  </span>
                </div>
                {photo.context && (
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white truncate block">{photo.context}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
