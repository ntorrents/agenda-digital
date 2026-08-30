'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseYmd(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = Array.from({ length: startOffset }, () => null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

type MonthCalendarProps = {
  selectedDate: string
  viewYear: number
  viewMonth: number
  locale: string
  todayLabel?: string
  onSelect: (date: string) => void
  onViewChange: (year: number, month: number) => void
  className?: string
}

export function MonthCalendar({
  selectedDate,
  viewYear,
  viewMonth,
  locale,
  todayLabel = 'Avui',
  onSelect,
  onViewChange,
  className,
}: MonthCalendarProps) {
  const today = new Date().toISOString().split('T')[0]
  const selected = parseYmd(selectedDate)

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, 1 + i)
      return date.toLocaleDateString(locale, { weekday: 'short' })
    })
  }, [locale])

  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth])

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    onViewChange(next.getFullYear(), next.getMonth())
  }

  return (
    <div
      className={cn(
        'w-full min-w-[280px] max-w-[320px] rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xl shadow-stone-900/10',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <p className="text-sm font-black capitalize text-stone-800">{monthLabel}</p>

        <button
          type="button"
          onClick={() => goMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          aria-label="Mes següent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-stone-400"
          >
            {label.replace('.', '')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-9" aria-hidden />
          }

          const dateStr = formatYmd(viewYear, viewMonth, day)
          const isSelected =
            selected.year === viewYear && selected.month === viewMonth && selected.day === day
          const isToday = dateStr === today

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={cn(
                'relative flex aspect-square min-h-9 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all',
                isSelected
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-stone-700 hover:bg-stone-100',
                isToday && !isSelected && 'ring-2 ring-teal-200 ring-inset'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(today)}
        className="mt-4 w-full rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-50"
      >
        {todayLabel}
      </button>
    </div>
  )
}

export { parseYmd }
