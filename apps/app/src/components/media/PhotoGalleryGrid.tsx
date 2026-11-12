'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { PhotoLightbox, type LightboxPhoto } from './PhotoLightbox'
import { downloadPhoto, photoFilenameFromUrl } from './downloadPhoto'

type PhotoItem = LightboxPhoto & {
  badge?: string
  badgeClassName?: string
}

export function PhotoGalleryGrid({
  photos,
  columnsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  thumbClass = 'aspect-square rounded-2xl',
  altPrefix = 'Foto',
}: {
  photos: PhotoItem[]
  columnsClass?: string
  thumbClass?: string
  altPrefix?: string
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxPhotos = useMemo(
    () => photos.map((p, i) => ({ url: p.url, alt: p.alt || `${altPrefix} ${i + 1}`, caption: p.caption })),
    [photos, altPrefix]
  )

  if (photos.length === 0) return null

  return (
    <>
      <div className={`grid ${columnsClass} gap-3 sm:gap-4`}>
        {photos.map((photo, index) => (
          <div key={`${photo.url}-${index}`} className="relative">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className={`group relative overflow-hidden bg-stone-100 border border-stone-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer w-full ${thumbClass}`}
            >
              <Image
                src={photo.url}
                alt={photo.alt || `${altPrefix} ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              {photo.badge && (
                <span
                  className={`absolute top-2 right-2 text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-sm ${photo.badgeClassName || 'bg-white/90 text-stone-700'}`}
                >
                  {photo.badge}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                void downloadPhoto(photo.url, photoFilenameFromUrl(photo.url, index))
              }}
              aria-label={`Descargar ${photo.alt || `${altPrefix} ${index + 1}`}`}
              className="absolute bottom-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-700 shadow-sm border border-stone-200/80 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  )
}
