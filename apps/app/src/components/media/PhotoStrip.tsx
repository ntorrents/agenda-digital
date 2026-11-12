'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { PhotoLightbox } from './PhotoLightbox'
import { downloadPhoto, photoFilenameFromUrl } from './downloadPhoto'

export function PhotoStrip({
  photos,
  size = 'md',
  altPrefix = 'Foto',
}: {
  photos: string[]
  size?: 'sm' | 'md'
  altPrefix?: string
  /** @deprecated Ya no se muestra texto de ampliar */
  showHint?: boolean
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const dim = size === 'sm' ? 'h-16 w-16 rounded-[16px]' : 'h-20 w-20 rounded-xl'

  if (photos.length === 0) return null

  const lightboxPhotos = photos.map((url, i) => ({
    url,
    alt: `${altPrefix} ${i + 1}`,
  }))

  return (
    <>
      <div className="flex gap-2 flex-wrap sm:flex-nowrap sm:overflow-x-auto pb-1 no-scrollbar snap-x">
        {photos.map((photo, index) => (
          <div key={`${photo}-${index}`} className="relative shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`${altPrefix} ${index + 1}`}
              className={`group relative overflow-hidden border border-stone-100 cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all ${dim}`}
            >
              <Image src={photo} alt={`${altPrefix} ${index + 1}`} fill className="object-cover" unoptimized />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                void downloadPhoto(photo, photoFilenameFromUrl(photo, index))
              }}
              aria-label={`Descargar ${altPrefix} ${index + 1}`}
              className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm border border-stone-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
            >
              <Download className="h-3 w-3" />
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
