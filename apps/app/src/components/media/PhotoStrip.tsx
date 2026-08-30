'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLightbox } from './PhotoLightbox'

export function PhotoStrip({
  photos,
  size = 'md',
  altPrefix = 'Foto',
}: {
  photos: string[]
  size?: 'sm' | 'md'
  altPrefix?: string
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
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={`shrink-0 snap-start relative overflow-hidden border border-stone-100 cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all ${dim}`}
          >
            <Image src={photo} alt={`${altPrefix} ${index + 1}`} fill className="object-cover" unoptimized />
          </button>
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
