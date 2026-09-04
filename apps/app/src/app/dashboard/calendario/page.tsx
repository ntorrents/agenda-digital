'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Users, Baby, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { recordClientAudit } from '@/app/actions/audit'

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCreating, setIsCreating] = useState(false)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('teacher')
  const t = useTranslations('dashboardCalendar')
  const locale = useLocale()
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audience, setAudience] = useState('school') // 'school' | 'staff'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  async function loadEvents() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUserRole(profile.role)
      setSchoolId(profile.school_id)
      
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data } = await supabase
        .from('events_announcements')
        .select('*')
        .eq('school_id', profile.school_id)
        .eq('event_type', 'event')
        .gte('event_date', startDate)
        .lte('event_date', endDate)

      if (data) setEvents(data)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !schoolId) return
    setIsSubmitting(true)

    const year = selectedDate.getFullYear()
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
    const day = selectedDate.getDate().toString().padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    const { data: inserted, error } = await supabase.from('events_announcements').insert([{
      school_id: schoolId,
      author_id: currentUserId,
      title,
      description: description || null,
      event_date: dateStr,
      event_type: 'event',
      audience
    }]).select('id').single()

    if (!error) {
      void recordClientAudit({
        action: 'calendar.event_create',
        entityType: 'events_announcements',
        entityId: inserted?.id,
        payload: { title, audience, event_date: dateStr },
      })
      setIsCreating(false)
      setTitle('')
      setDescription('')
      loadEvents()
    }
    setIsSubmitting(false)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    await supabase.from('events_announcements').delete().eq('id', id)
    void recordClientAudit({
      action: 'calendar.event_delete',
      entityType: 'events_announcements',
      entityId: id,
    })
    loadEvents()
  }

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Start on Monday

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const sYear = selectedDate.getFullYear()
  const sMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
  const sDay = selectedDate.getDate().toString().padStart(2, '0')
  const selectedDateStr = `${sYear}-${sMonth}-${sDay}`
  
  const selectedEvents = events.filter(e => e.event_date === selectedDateStr)

  const tDate = new Date()
  const tYear = tDate.getFullYear()
  const tMonth = (tDate.getMonth() + 1).toString().padStart(2, '0')
  const tDay = tDate.getDate().toString().padStart(2, '0')
  const todayStr = `${tYear}-${tMonth}-${tDay}`

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US'
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'

  // Monday to Sunday weekdays
  const weekdayNames = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(2026, 0, 5 + i)
    const name = d.toLocaleDateString(dateLocale, { weekday: 'short' })
    return name.replace(/\./g, '')
  })

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)] lg:h-screen lg:overflow-hidden">
      
      {/* Calendar Area — en mòbil es veu primer la graella mensual */}
      <div className="flex-1 lg:overflow-y-auto bg-[#faf8f5] p-4 sm:p-6 lg:p-8 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-stone-800 capitalize">
                {currentDate.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl h-10 w-10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="rounded-xl font-bold h-10">
                {t('today')}
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl h-10 w-10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-stone-200/80 shadow-sm overflow-hidden p-3 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {weekdayNames.map(day => (
                <div key={day} className="text-center text-[10px] sm:text-xs font-black text-stone-400 uppercase tracking-wider py-2 capitalize">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-3 auto-rows-[52px] sm:auto-rows-[85px]">
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-stone-50/50 rounded-xl sm:rounded-2xl border border-transparent" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = i + 1
                const fullDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
                const dayEvents = events.filter(e => e.event_date === fullDateStr)
                const isSelected = selectedDateStr === fullDateStr
                const isToday = todayStr === fullDateStr
 
                return (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date))
                      setIsCreating(false)
                    }}
                    className={cn(
                      'relative flex flex-col p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all text-left hover:border-teal-300 hover:shadow-md cursor-pointer',
                      isSelected ? 'border-teal-500 bg-teal-50 ring-2 sm:ring-4 ring-teal-500/10' : 'border-stone-200/80 bg-white',
                      isToday && !isSelected ? 'border-amber-300 bg-amber-50/30' : ''
                    )}
                  >
                    <span className={cn(
                      'text-xs sm:text-sm font-black w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full shrink-0',
                      isToday ? 'bg-amber-100 text-amber-700' : (isSelected ? 'bg-teal-600 text-white' : 'text-stone-700')
                    )}>
                      {date}
                    </span>
                    
                    <div className="mt-0.5 sm:mt-1 flex-1 w-full overflow-hidden flex flex-col gap-1">
                      <div className="hidden sm:flex flex-col gap-1 w-full px-1">
                        {dayEvents.slice(0, 3).map(e => (
                          <div key={e.id} className={cn(
                            'text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-1 w-full',
                            e.audience === 'school' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                          )} title={e.title}>
                            {e.audience === 'school' ? <Baby className="h-2.5 w-2.5 shrink-0" /> : <Users className="h-2.5 w-2.5 shrink-0" />}
                            <span className="truncate">{e.title}</span>
                          </div>
                        ))}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="sm:hidden flex justify-center gap-0.5 mt-auto pb-0.5">
                          {dayEvents.slice(0, 3).map(e => (
                            <span
                              key={e.id}
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                e.audience === 'school' ? 'bg-blue-500' : 'bg-purple-500'
                              )}
                            />
                          ))}
                        </div>
                      )}
                      {dayEvents.length > 3 && (
                        <div className="hidden sm:block text-[9px] font-bold text-stone-400 pl-1">
                          {t('moreEvents', { count: dayEvents.length - 3 })}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
        </div>
      </div>

      {/* Side Panel for Selected Day */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-stone-200/80 flex flex-col shrink-0 lg:h-full lg:min-h-0">
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/50">
          <h3 className="text-2xl sm:text-xl font-black text-stone-800 capitalize leading-tight">
            {selectedDate.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <p className="text-sm text-stone-500 font-medium mt-1">
            {t('eventsCount', { count: selectedEvents.length })}
          </p>
        </div>

        <div className="flex-1 lg:overflow-y-auto p-5 sm:p-6 space-y-4 pb-10">
          {isCreating ? (
            <form onSubmit={handleCreateEvent} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-800 text-sm">{t('newEvent')}</h4>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsCreating(false)} className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('labelTitle')}</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={t('placeholderTitle')}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('labelDesc')}</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder={t('placeholderDesc')}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 block">{t('labelAudience')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAudience('school')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors',
                        audience === 'school' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-stone-200 text-stone-500'
                      )}
                    >
                      <Baby className="h-3.5 w-3.5" /> {t('audienceAll')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudience('staff')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors',
                        audience === 'staff' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-stone-200 text-stone-500'
                      )}
                    >
                      <Users className="h-3.5 w-3.5" /> {t('audienceStaff')}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-bold">
                {isSubmitting ? t('btnSaving') : t('btnCreate')}
              </Button>
            </form>
          ) : (
            <>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-stone-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="h-8 w-8 text-stone-300" />
                  </div>
                  <p className="text-sm font-medium text-stone-500">{t('emptyDay')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(event => (
                    <div key={event.id} className={cn(
                      'p-4 rounded-2xl border flex flex-col gap-2 relative group',
                      event.audience === 'school' ? 'bg-blue-50/50 border-blue-100' : 'bg-purple-50/50 border-purple-100'
                    )}>
                      {(userRole === 'admin' || event.author_id === currentUserId) && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-600 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        {event.audience === 'school' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Baby className="h-3 w-3" /> {t('audienceAllBadge')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Users className="h-3 w-3" /> {t('audienceStaffBadge')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs font-medium text-stone-600 leading-relaxed">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setIsCreating(true)}
                className="w-full bg-white border-2 border-dashed border-stone-200 text-stone-600 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-2xl h-12 font-bold shadow-none"
              >
                <Plus className="h-4 w-4 mr-2" /> {t('btnAdd')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
