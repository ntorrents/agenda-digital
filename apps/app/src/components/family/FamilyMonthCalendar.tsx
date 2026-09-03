'use client'

import { useMemo, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

type FamilyEvent = {
  id: string
  title: string
  description: string | null
  event_date: string
  audience: string
}

export function FamilyMonthCalendar({ events }: { events: FamilyEvent[] }) {
  const t = useTranslations('calendar')
  const locale = useLocale()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US',
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const weekdayNames = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(2026, 0, 5 + i)
        return d.toLocaleDateString(dateLocale, { weekday: 'short' }).replace(/\./g, '')
      }),
    [dateLocale]
  )

  const toStr = (d: Date) => {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const selectedDateStr = toStr(selectedDate)
  const todayStr = toStr(new Date())
  const selectedEvents = events.filter((e) => e.event_date === selectedDateStr)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) {
      map.set(e.event_date, (map.get(e.event_date) || 0) + 1)
    }
    return map
  }, [events])

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[24px] border border-stone-200/60 shadow-xs p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-stone-800 capitalize">
            {currentDate.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const now = new Date()
                setCurrentDate(now)
                setSelectedDate(now)
              }}
              className="rounded-xl font-bold h-9 text-xs px-3"
            >
              {t('today')}
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdayNames.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-black text-stone-400 uppercase py-1 capitalize"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1
            const fullDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${date.toString().padStart(2, '0')}`
            const count = eventsByDate.get(fullDateStr) || 0
            const isSelected = selectedDateStr === fullDateStr
            const isToday = todayStr === fullDateStr

            return (
              <button
                key={date}
                type="button"
                onClick={() =>
                  setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))
                }
                className={cn(
                  'aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all',
                  isSelected
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/15'
                    : 'border-stone-100 bg-stone-50/50 hover:border-purple-200',
                  isToday && !isSelected ? 'border-amber-300 bg-amber-50/40' : ''
                )}
              >
                <span
                  className={cn(
                    'text-sm font-black',
                    isSelected ? 'text-purple-700' : isToday ? 'text-amber-700' : 'text-stone-700'
                  )}
                >
                  {date}
                </span>
                {count > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-stone-700 capitalize px-1">
          {selectedDate.toLocaleDateString(dateLocale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h3>

        {selectedEvents.length === 0 ? (
          <div className="text-center p-6 bg-white rounded-2xl border border-stone-200/60 shadow-xs">
            <div className="bg-stone-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <CalendarIcon className="h-6 w-6 text-stone-300" />
            </div>
            <p className="text-sm text-stone-500 font-medium">{t('noEventsDay')}</p>
          </div>
        ) : (
          selectedEvents.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-[24px] bg-white border border-stone-200/60 shadow-xs"
            >
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  event.audience === 'school'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {event.audience === 'school' ? t('general') : t('classroom')}
              </span>
              <h4 className="text-base font-bold text-stone-800 mt-2">{event.title}</h4>
              {event.description && (
                <p className="text-sm text-stone-500 mt-1 whitespace-pre-wrap">{event.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
