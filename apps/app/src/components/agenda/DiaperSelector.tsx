'use client'

import { Droplets, Minus, Plus } from 'lucide-react'
import { PillSelector, type PillOption } from '@/components/shared/PillSelector'
import type { DiaperType } from '@/types/enums'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toggleDiaperType } from '@/lib/diaper'

interface DiaperSelectorProps {
  types: DiaperType[]
  changes: number
  onTypesChange: (value: DiaperType[]) => void
  onChangesChange: (value: number) => void
  className?: string
}

export function DiaperSelector({
  types,
  changes,
  onTypesChange,
  onChangesChange,
  className,
}: DiaperSelectorProps) {
  const t = useTranslations('dailyLogForm')
  const tAgenda = useTranslations('agenda')

  const typeOptions: PillOption<DiaperType>[] = [
    { value: 'soft', label: t('diaperSoft'), icon: <Droplets className="h-4 w-4" /> },
    { value: 'normal', label: t('diaperNormal'), icon: <Droplets className="h-4 w-4" /> },
    { value: 'liquid', label: t('diaperLiquid'), icon: <Droplets className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{t('diaperType')}</span>
      <div className="flex flex-wrap gap-2">
        {typeOptions.map(option => {
          const active = types.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onTypesChange(toggleDiaperType(types, option.value))}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all',
                active
                  ? 'bg-amber-400 text-amber-950 border-amber-400'
                  : 'bg-amber-50/80 text-amber-900 border-amber-100 hover:bg-amber-100'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{tAgenda('changes')}</span>
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
