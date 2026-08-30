import { Calendar } from 'lucide-react'
import { formatGalleryDayHeader, type GalleryPhoto } from '@/lib/group-photos-by-day'
import { PhotoGalleryGrid } from '@/components/media/PhotoGalleryGrid'

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
          <PhotoGalleryGrid
            photos={photos.map((photo, index) => ({
              url: photo.url,
              alt: `${photoAltPrefix} ${date}`,
              caption: photo.context,
              badge: photo.typeLabel,
              badgeClassName:
                photo.type === 'individual'
                  ? 'bg-white/90 text-stone-700'
                  : 'bg-emerald-500/90 text-white',
            }))}
            altPrefix={photoAltPrefix}
          />
        </section>
      ))}
    </div>
  )
}
