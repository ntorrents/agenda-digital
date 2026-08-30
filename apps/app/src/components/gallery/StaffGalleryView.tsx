'use client'

import { useTranslations } from 'next-intl'
import { GalleryByDay } from '@/components/gallery/GalleryByDay'
import { DownloadAllPhotosButton } from '@/components/family/DownloadAllPhotosButton'
import { groupPhotosByDay, type GalleryPhoto } from '@/lib/group-photos-by-day'

export function StaffGalleryView({
  photos,
  locale,
  zipName,
}: {
  photos: GalleryPhoto[]
  locale: string
  zipName?: string
}) {
  const t = useTranslations('dashboardGaleria')
  const groups = groupPhotosByDay(photos)
  const downloadItems = photos.map((photo, index) => ({
    url: photo.url,
    filename: `${photo.date}-${photo.type}-${index + 1}.jpg`,
  }))

  if (photos.length === 0) {
    return (
      <div className="bg-white border border-stone-200/60 rounded-[32px] p-12 text-center shadow-xs">
        <p className="text-stone-500">{t('emptyDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DownloadAllPhotosButton photos={downloadItems} label={t('downloadAll')} zipName={zipName} />
      </div>
      <GalleryByDay groups={groups} locale={locale} photoAltPrefix={t('photoAlt')} />
    </div>
  )
}
