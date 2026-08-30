'use client'

import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxPhoto = {
  url: string
  alt?: string
  caption?: string
}

type PhotoLightboxProps = {
  photos: LightboxPhoto[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function PhotoLightbox({ photos, index, onClose, onIndexChange }: PhotoLightboxProps) {
  const hasPrev = index > 0
  const hasNext = index < photos.length - 1
  const current = photos[index]

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(index - 1)
  }, [hasPrev, index, onIndexChange])

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(index + 1)
  }, [hasNext, index, onIndexChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, goPrev, goNext])

  if (!current) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-stone-950/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 shrink-0">
        <span className="text-xs font-bold text-white/70 tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Tancar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0 relative">
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 sm:left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          className="relative max-h-[75vh] max-w-[min(100%,900px)] w-full aspect-[4/3] sm:aspect-auto sm:h-[75vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={current.url}
            alt={current.alt || ''}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 sm:right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Següent"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {current.caption && (
        <p className="text-center text-sm font-medium text-white/80 px-6 pb-6 shrink-0">
          {current.caption}
        </p>
      )}
    </div>,
    document.body
  )
}
