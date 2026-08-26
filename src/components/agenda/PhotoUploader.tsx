'use client'

import { Camera, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface PhotoUploaderProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  className,
}: PhotoUploaderProps) {
  const tLog = useTranslations('dailyLog')

  const handleFileSelect = () => {
    // TODO: Integrar con Supabase Storage
    // Por ahora, placeholder para la demo
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.capture = 'environment'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      // Create temporary object URLs for preview
      const newPhotos = Array.from(files)
        .slice(0, maxPhotos - photos.length)
        .map((file) => URL.createObjectURL(file))

      onPhotosChange([...photos, ...newPhotos])
    }
    input.click()
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-sm font-medium text-muted-foreground">
        {tLog('photos')}
      </span>

      <div className="flex flex-wrap gap-2">
        {/* Photo thumbnails */}
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative h-20 w-20 overflow-hidden rounded-2xl shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Foto ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className={cn(
                'absolute -top-0 -right-0 flex h-6 w-6 items-center justify-center',
                'rounded-full bg-red-500 text-white shadow-md',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                'cursor-pointer'
              )}
              aria-label={`Eliminar foto ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleFileSelect}
            className={cn(
              'pill-press flex h-20 w-20 flex-col items-center justify-center gap-1',
              'rounded-2xl border-2 border-dashed border-teal-200',
              'text-teal-500 hover:bg-teal-50 hover:border-teal-400',
              'transition-all duration-200',
              'cursor-pointer'
            )}
          >
            <Camera className="h-5 w-5" />
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
