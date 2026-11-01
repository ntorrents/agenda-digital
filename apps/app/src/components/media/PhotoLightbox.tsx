'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { ZoomableImage } from './ZoomableImage'

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
  const [zoomed, setZoomed] = useState(false)

  const goPrev = useCallback(() => {
    if (!zoomed && hasPrev) onIndexChange(index - 1)
  }, [hasPrev, index, onIndexChange, zoomed])

  const goNext = useCallback(() => {
    if (!zoomed && hasNext) onIndexChange(index + 1)
  }, [hasNext, index, onIndexChange, zoomed])

  useEffect(() => {
    setZoomed(false)
  }, [index])

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
      <div className="flex items-center justify-between p-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-bold text-white/70 tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 pb-2 min-h-0 relative">
        {!zoomed && hasPrev && (
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

        <div className="relative h-[min(78vh,100%)] w-full max-w-[min(100%,960px)]">
          <ZoomableImage
            src={current.url}
            alt={current.alt || ''}
            onInteractChange={setZoomed}
          />
        </div>

        {!zoomed && hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 sm:right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="px-6 pb-5 shrink-0 space-y-2" onClick={(e) => e.stopPropagation()}>
        {current.caption && (
          <p className="text-center text-sm font-medium text-white/80">{current.caption}</p>
        )}
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/55">
          <ZoomIn className="h-3.5 w-3.5" />
          Pellizca o doble toque para ampliar · rueda en el ordenador
        </p>
      </div>
    </div>,
    document.body
  )
}
