'use client'

import { useState } from 'react'
import { GalleryByDay } from '@/components/gallery/GalleryByDay'
import type { GalleryPhoto } from '@/lib/group-photos-by-day'
import { cn } from '@/lib/utils'

export function FamilyGalleryView({
  dayGroups,
  allGroups,
  dayEmpty,
  allEmpty,
  locale,
  photoAltPrefix,
  noPhotosLabel,
  viewDayLabel,
  viewAllLabel,
}: {
  dayGroups: { date: string; photos: GalleryPhoto[] }[]
  allGroups: { date: string; photos: GalleryPhoto[] }[]
  dayEmpty: boolean
  allEmpty: boolean
  locale: string
  photoAltPrefix: string
  noPhotosLabel: string
  viewDayLabel: string
  viewAllLabel: string
}) {
  const [mode, setMode] = useState<'day' | 'all'>('day')
  const groups = mode === 'day' ? dayGroups : allGroups
  const empty = mode === 'day' ? dayEmpty : allEmpty

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
        <button
          type="button"
          onClick={() => setMode('day')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all',
            mode === 'day' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
          )}
        >
          {viewDayLabel}
        </button>
        <button
          type="button"
          onClick={() => setMode('all')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all',
            mode === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
          )}
        >
          {viewAllLabel}
        </button>
      </div>

      {empty ? (
        <div className="text-center p-8 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
          <p className="text-stone-500 font-medium">{noPhotosLabel}</p>
        </div>
      ) : (
        <GalleryByDay groups={groups} locale={locale} photoAltPrefix={photoAltPrefix} />
      )}
    </div>
  )
}
