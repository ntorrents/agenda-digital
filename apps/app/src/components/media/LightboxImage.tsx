'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PhotoLightbox } from './PhotoLightbox'

export function LightboxImage({
  src,
  alt,
  className = 'w-full h-auto max-h-64 object-cover',
  wrapperClassName = 'rounded-xl overflow-hidden shadow-sm border border-stone-200 inline-block cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all',
}: {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={wrapperClassName}>
        <img src={src} alt={alt} className={className} />
      </button>
      {open && (
        <PhotoLightbox
          photos={[{ url: src, alt }]}
          index={0}
          onClose={() => setOpen(false)}
          onIndexChange={() => {}}
        />
      )}
    </>
  )
}

/** Versió amb Next/Image per thumbnails */
export function LightboxThumbnail({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-500/30 transition-all ${className || ''}`}
      >
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      </button>
      {open && (
        <PhotoLightbox
          photos={[{ url: src, alt }]}
          index={0}
          onClose={() => setOpen(false)}
          onIndexChange={() => {}}
        />
      )}
    </>
  )
}
