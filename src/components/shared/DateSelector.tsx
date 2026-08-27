'use client'

import { useRef, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
  className?: string
}

export function DateSelector({ className }: DateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get currently selected date from URL, default to today
  const urlDate = searchParams.get('date')
  const selectedDate = urlDate ? new Date(urlDate) : new Date()
  selectedDate.setHours(0, 0, 0, 0)

  // Generate an array of 14 days (7 days before, 7 days after today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dates = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 7 + i)
    return d
  })

  // Center the scroll on mount to the selected date
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]')
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
  }, [selectedDate.getTime()])

  const handleDateChange = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    // Create new URLSearchParams to preserve other params
    const newParams = new URLSearchParams(searchParams.toString())
    
    // If it's today, we can just remove the date param for cleaner URLs, 
    // but keeping it explicit is safer for server fetching. Let's set it.
    newParams.set('date', dateString)
    
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => {
          const isSelected = date.getTime() === selectedDate.getTime()
          const isToday = date.getTime() === today.getTime()
          
          let dayName = new Intl.DateTimeFormat('ca-ES', { weekday: 'short' }).format(date)
          dayName = dayName.replace(/\./g, '')
          const dayNumber = date.getDate()

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateChange(date)}
              data-selected={isSelected}
              className={cn(
                'flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl snap-center shrink-0 border transition-all active:scale-95 cursor-pointer',
                isSelected 
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/25' 
                  : isToday 
                    ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                    : 'bg-white text-stone-500 border-stone-200/80 hover:bg-stone-50'
              )}
            >
              <span className={cn('text-[10px] font-bold uppercase tracking-wider', isSelected ? 'text-teal-100' : isToday ? 'text-teal-600' : 'text-stone-400')}>
                {dayName}
              </span>
              <span className={cn('text-lg font-black mt-0.5', isSelected ? 'text-white' : 'text-stone-800')}>
                {dayNumber}
              </span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-teal-600 mt-1 absolute bottom-1.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
