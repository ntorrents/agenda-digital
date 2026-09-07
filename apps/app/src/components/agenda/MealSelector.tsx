'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronsDown, X } from 'lucide-react'
import { PillSelector, type PillOption } from '@/components/shared/PillSelector'
import type { MealAmount } from '@/types/enums'
import { MEAL_TYPE_OPTIONS } from '@/types/enums'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type SelectableMealType = (typeof MEAL_TYPE_OPTIONS)[number]

type MealValues = Record<SelectableMealType, MealAmount | null>

interface MealSelectorProps {
  value: MealValues
  onChange: (value: MealValues) => void
  className?: string
}

export function MealSelector({ value, onChange, className }: MealSelectorProps) {
  const t = useTranslations('meals')
  const tLog = useTranslations('dailyLog')
  const [activeTab, setActiveTab] = useState<SelectableMealType>('breakfast')

  const amountOptions: PillOption<MealAmount>[] = [
    { value: 'all', label: t('all'), icon: <Check className="h-4 w-4" /> },
    { value: 'most', label: t('most'), icon: <ChevronDown className="h-4 w-4" /> },
    { value: 'little', label: t('little'), icon: <ChevronsDown className="h-4 w-4" /> },
    { value: 'none', label: t('none'), icon: <X className="h-4 w-4" /> },
  ]

  const handleMealChange = (amount: MealAmount) => {
    onChange({
      ...value,
      [activeTab]: amount,
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
        {tLog('meals')}
      </span>

      {/* Meal type tabs */}
      <div className="flex gap-1.5 rounded-[18px] bg-orange-50/80 p-1.5 border border-orange-100">
        {MEAL_TYPE_OPTIONS.map((mealType) => {
          const isActive = activeTab === mealType
          const hasValue = value[mealType] !== null
          return (
            <button
              key={mealType}
              type="button"
              onClick={() => setActiveTab(mealType)}
              className={cn(
                'relative flex-1 rounded-xl px-3 py-2 text-xs font-bold',
                'transition-all duration-150 ease-out active:scale-95',
                'cursor-pointer select-none',
                isActive
                  ? 'bg-white text-orange-950 shadow-sm border border-orange-100'
                  : 'text-orange-700/80 hover:text-orange-900 hover:bg-orange-100/50'
              )}
            >
              {t(mealType)}
              {hasValue && !isActive && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
              )}
            </button>
          )
        })}
      </div>

      {/* Amount pills for active meal */}
      <PillSelector
        options={amountOptions}
        value={value[activeTab]}
        onChange={handleMealChange}
        colorScheme="salmon"
        size="md"
      />
    </div>
  )
}
