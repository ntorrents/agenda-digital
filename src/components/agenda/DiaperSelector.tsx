'use client'

import { Droplets, CircleDot, Minus, Plus } from 'lucide-react'
import { PillSelector, type PillOption } from '@/components/shared/PillSelector'
import type { DiaperType } from '@/types/enums'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface DiaperSelectorProps {
  type: DiaperType | null
  changes: number
  onTypeChange: (value: DiaperType) => void
  onChangesChange: (value: number) => void
  className?: string
}

export function DiaperSelector({
  type,
  changes,
  onTypeChange,
  onChangesChange,
  className,
}: DiaperSelectorProps) {
  const t = useTranslations('diaper')
  const tLog = useTranslations('dailyLog')

  const typeOptions: PillOption<DiaperType>[] = [
    { value: 'pee', label: t('pee'), icon: <Droplets className="h-4 w-4" /> },
    { value: 'poo', label: t('poo'), icon: <CircleDot className="h-4 w-4" /> },
    { value: 'both', label: t('both'), icon: <><Droplets className="h-3.5 w-3.5" /><CircleDot className="h-3.5 w-3.5" /></> },
    { value: 'dry', label: t('dry'), icon: <Minus className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <PillSelector
        options={typeOptions}
        value={type}
        onChange={onTypeChange}
        colorScheme="mustard"
        label={tLog('diaper')}
      />

      {/* Changes counter */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{t('changes')}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangesChange(Math.max(0, changes - 1))}
            disabled={changes === 0}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border',
              'transition-all duration-150 active:scale-95',
              'cursor-pointer select-none',
              changes === 0
                ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            )}
            aria-label="Menys canvis"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="min-w-[2.5rem] text-center text-lg font-black tabular-nums text-stone-800">
            {changes}
          </span>

          <button
            type="button"
            onClick={() => onChangesChange(changes + 1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border',
              'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
              'transition-all duration-150 active:scale-95',
              'cursor-pointer select-none'
            )}
            aria-label="Més canvis"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
