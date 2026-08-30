'use client'

import { Moon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface NapTrackerProps {
  napStart: string | null
  napEnd: string | null
  onNapStartChange: (value: string | null) => void
  onNapEndChange: (value: string | null) => void
  className?: string
}

export function NapTracker({
  napStart,
  napEnd,
  onNapStartChange,
  onNapEndChange,
  className,
}: NapTrackerProps) {
  const tLog = useTranslations('dailyLog')
  const tNap = useTranslations('nap')

  const duration = napStart && napEnd ? calculateDuration(napStart, napEnd) : null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
        {tLog('nap')}
      </span>

      <div className="flex items-center gap-3 rounded-[20px] bg-emerald-50/80 border border-emerald-100 p-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800 shrink-0">
          <Moon className="h-5 w-5" />
        </div>

        <div className="flex flex-1 items-center gap-2">
          {/* Start time */}
          <div className="flex flex-col">
            <label className="text-[11px] text-emerald-800 font-bold uppercase">{tNap('start')}</label>
            <input
              type="time"
              value={napStart ?? ''}
              onChange={(e) => onNapStartChange(e.target.value || null)}
              className={cn(
                'w-24 rounded-xl border border-emerald-200 bg-white px-2 py-1.5 text-xs font-bold',
                'text-stone-800 shadow-2xs',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500'
              )}
            />
          </div>

          <span className="mt-4 text-stone-400 font-bold">—</span>

          {/* End time */}
          <div className="flex flex-col">
            <label className="text-[11px] text-emerald-800 font-bold uppercase">{tNap('end')}</label>
            <input
              type="time"
              value={napEnd ?? ''}
              onChange={(e) => onNapEndChange(e.target.value || null)}
              className={cn(
                'w-24 rounded-xl border border-emerald-200 bg-white px-2 py-1.5 text-xs font-bold',
                'text-stone-800 shadow-2xs',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500'
              )}
            />
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-200 px-2.5 py-1 shrink-0">
            <Clock className="h-3.5 w-3.5 text-emerald-800" />
            <span className="text-xs font-bold text-emerald-900">{duration}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function calculateDuration(start: string, end: string): string | null {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return null

  let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  if (diffMinutes < 0) diffMinutes += 24 * 60

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}
