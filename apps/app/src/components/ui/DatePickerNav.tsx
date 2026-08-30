'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { MonthCalendar, parseYmd } from '@/components/ui/MonthCalendar'
import { cn } from '@/lib/utils'

function shiftDate(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + deltaDays)
  return d.toISOString().split('T')[0]
}

const DATE_LOCALE_MAP: Record<string, string> = {
  ca: 'ca-ES',
  es: 'es-ES',
  fr: 'fr-FR',
  en: 'en-US',
}

const POPOVER_MAX_WIDTH = 320
const VIEWPORT_PADDING = 16

function getPopoverWidth() {
  if (typeof window === 'undefined') return POPOVER_MAX_WIDTH
  return Math.min(window.innerWidth - VIEWPORT_PADDING * 2, POPOVER_MAX_WIDTH)
}

/** Dropdown clàssic: sota el control, alineat a l'esquerra (o a la dreta si no hi cap) */
function computePopoverPosition(anchorRect: DOMRect, popoverWidth: number) {
  const top = anchorRect.bottom + 8
  let left = anchorRect.left

  if (left + popoverWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = anchorRect.right - popoverWidth
  }

  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - popoverWidth - VIEWPORT_PADDING)
  )

  return { top, left }
}

type DatePickerNavProps = {
  currentDate: string
  variant?: 'default' | 'compact'
  replace?: boolean
  className?: string
}

export function DatePickerNav({
  currentDate,
  variant = 'default',
  replace = false,
  className,
}: DatePickerNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const locale = useLocale()
  const t = useTranslations('datePicker')

  const parsed = parseYmd(currentDate)
  const [viewYear, setViewYear] = useState(parsed.year)
  const [viewMonth, setViewMonth] = useState(parsed.month)

  const dateLocale = DATE_LOCALE_MAP[locale] || 'ca-ES'
  const isCompact = variant === 'compact'

  const formatted = new Date(currentDate + 'T12:00:00').toLocaleDateString(dateLocale, {
    weekday: 'short',
    day: 'numeric',
    month: isCompact ? 'short' : 'long',
  })

  useEffect(() => {
    const next = parseYmd(currentDate)
    setViewYear(next.year)
    setViewMonth(next.month)
  }, [currentDate])

  useEffect(() => {
    if (!open || !controlRef.current) return

    const updatePosition = () => {
      if (!controlRef.current) return
      const rect = controlRef.current.getBoundingClientRect()
      setPopoverPos(computePopoverPosition(rect, getPopoverWidth()))
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
      if ((event.target as HTMLElement).closest('[data-date-picker-popover]')) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const navigate = (date: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', date)
    const url = `${pathname}?${params.toString()}`
    if (replace) {
      router.replace(url, { scroll: false })
    } else {
      router.push(url)
    }
  }

  const selectDate = (date: string) => {
    setOpen(false)
    navigate(date)
  }

  const popover =
    open && popoverPos && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-date-picker-popover
            className="fixed z-[200] animate-in fade-in slide-in-from-top-1 duration-150"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <MonthCalendar
              selectedDate={currentDate}
              viewYear={viewYear}
              viewMonth={viewMonth}
              locale={dateLocale}
              todayLabel={t('today')}
              onSelect={selectDate}
              onViewChange={(year, month) => {
                setViewYear(year)
                setViewMonth(month)
              }}
              className="w-[min(calc(100vw-2rem),320px)] min-w-[280px]"
            />
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div
        ref={containerRef}
        className={cn('relative flex flex-col', isCompact ? 'items-center' : 'gap-1.5', className)}
      >
        {!isCompact && (
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">
            {t('dateLabel')}
          </label>
        )}

        <div
          ref={controlRef}
          className={cn(
            'flex items-center gap-1 bg-white border border-stone-200 rounded-xl shadow-xs shrink-0',
            isCompact ? 'p-0.5 w-full max-w-[280px]' : 'p-1'
          )}
        >
          <button
            type="button"
            onClick={() => navigate(shiftDate(currentDate, -1))}
            className={cn(
              'flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors shrink-0',
              isCompact ? 'h-8 w-8' : 'h-9 w-9'
            )}
            aria-label={t('prevDay')}
          >
            <ChevronLeft className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg hover:bg-stone-50 transition-colors min-w-0',
              isCompact ? 'px-2 py-1.5' : 'px-3 py-2 min-w-[160px]'
            )}
          >
            <CalendarDays className={cn('text-teal-600 shrink-0', isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            <span
              className={cn(
                'font-bold text-stone-800 capitalize truncate',
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              {formatted}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate(shiftDate(currentDate, 1))}
            className={cn(
              'flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors shrink-0',
              isCompact ? 'h-8 w-8' : 'h-9 w-9'
            )}
            aria-label={t('nextDay')}
          >
            <ChevronRight className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
        </div>
      </div>
      {popover}
    </>
  )
}
