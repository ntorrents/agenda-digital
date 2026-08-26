'use client'

import { cn } from '@/lib/utils'

export interface PillOption<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface PillSelectorProps<T extends string> {
  options: PillOption<T>[]
  value: T | null
  onChange: (value: T) => void
  colorScheme?: 'teal' | 'mint' | 'salmon' | 'mustard'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const colorSchemes = {
  teal: {
    active: 'bg-teal-700 text-white shadow-md shadow-teal-700/25 border-teal-700',
    inactive: 'bg-teal-50/80 text-teal-800 hover:bg-teal-100 border-teal-100',
  },
  mint: {
    active: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border-emerald-600',
    inactive: 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 border-emerald-100',
  },
  salmon: {
    active: 'bg-orange-500 text-white shadow-md shadow-orange-500/25 border-orange-500',
    inactive: 'bg-orange-50/80 text-orange-800 hover:bg-orange-100 border-orange-100',
  },
  mustard: {
    active: 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/25 border-amber-400',
    inactive: 'bg-amber-50/80 text-amber-900 hover:bg-amber-100 border-amber-100',
  },
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2.5',
}

export function PillSelector<T extends string>({
  options,
  value,
  onChange,
  colorScheme = 'teal',
  size = 'md',
  label,
  className,
}: PillSelectorProps<T>) {
  const scheme = colorSchemes[colorScheme]

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
      )}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isActive = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex items-center justify-center rounded-full font-bold border',
                'transition-all duration-150 ease-out active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40',
                'cursor-pointer select-none',
                sizes[size],
                isActive ? scheme.active : scheme.inactive
              )}
            >
              {option.icon && (
                <span className="shrink-0">{option.icon}</span>
              )}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
