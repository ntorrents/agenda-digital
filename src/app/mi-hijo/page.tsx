import { Utensils, Moon, Droplets, Smile, Calendar, MessageCircle, Sparkles } from 'lucide-react'
import { DateSelector } from '@/components/shared/DateSelector'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FamilyPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the first student linked to this guardian
  // In a real multi-student scenario, we'd have a student selector. For MVP, pick first.
  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let dailyLog = null
  let studentName = ''

  if (guardianRel) {
    const studentId = guardianRel.student_id

    const { data: student } = await supabase
      .from('students')
      .select('first_name')
      .eq('id', studentId)
      .single()

    studentName = student?.first_name || ''

    // Fetch the daily log for this student on the selected date
    const { data: log } = await supabase
      .from('daily_logs')
      .select(`
        *,
        teacher:profiles!teacher_id(full_name)
      `)
      .eq('student_id', studentId)
      .eq('date', dateStr)
      .maybeSingle()
      
    dailyLog = log
  }

  const selectedDate = new Date(dateStr)
  selectedDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isFuture = selectedDate.getTime() > today.getTime()

  // Helper to translate meal enum
  const mealMap: Record<string, string> = {
    all: 'Tot ✅',
    most: 'Gairebé tot',
    little: 'Poc',
    none: 'Res ❌'
  }
  
  const moodMap: Record<string, string> = {
    happy: 'Content/a',
    calm: 'Tranquil/a',
    sad: 'Trist/a',
    irritable: 'Irritable'
  }

  const diaperMap: Record<string, string> = {
    pee: 'Pipí',
    poo: 'Caca',
    both: 'Pipí + Caca',
    dry: 'Sec'
  }

  return (
    <main className="max-w-md mx-auto pt-2 pb-8 space-y-4">
      
      {/* Selector de Fecha Horizontal */}
      {/* 
        Warning: DateSelector is a Client Component. We can pass the selected date from server.
        Wait, DateSelector internally reads searchParams anyway! But we don't need to pass state.
        We just render it. 
      */}
      <DateSelector />

      <div className="px-4 space-y-4">
        {isFuture ? (
          <div className="rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha dades</h3>
            <p className="text-xs text-stone-500 mt-1">Aquest dia encara no ha arribat.</p>
          </div>
        ) : !dailyLog ? (
           <div className="rounded-[28px] border border-stone-200/80 bg-stone-50 p-8 text-center shadow-xs">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
               <Calendar className="h-6 w-6" />
             </div>
             <h3 className="text-sm font-bold text-stone-800">L&apos;agenda encara no s&apos;ha omplert</h3>
             <p className="text-xs text-stone-500 mt-1">L&apos;educadora encara no ha guardat les dades per a aquest dia.</p>
           </div>
        ) : (
          <>
            {/* Highlight: Nota del dia de l'Educadora */}
            {dailyLog.notes && (
              <div className="rounded-[28px] border border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 p-5 shadow-xs relative overflow-hidden space-y-2.5">
                <div className="flex items-center gap-2 text-teal-800">
                  <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">Nota de l&apos;Educadora</span>
                </div>

                <p className="text-sm text-stone-800 font-medium leading-relaxed">
                  &ldquo;{dailyLog.notes}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-teal-100 text-xs text-teal-800 font-semibold">
                  <span>{dailyLog.teacher?.full_name || 'Educadora'}</span>
                  {dailyLog.mood && (
                    <span className="flex items-center gap-1">
                      <Smile className="h-4 w-4 text-teal-600" /> {moodMap[dailyLog.mood]}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3 Pastel Summary Blocks: Food, Nap, Diaper */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* 1. Menjar (Salmón) */}
              <div className="flex flex-col rounded-[24px] bg-orange-50/90 border border-orange-200/80 p-3.5 text-orange-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-200 text-orange-800">
                    <Utensils className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-orange-700">Dinar</span>
                </div>
                <p className="text-base font-black leading-tight">{dailyLog.meal_lunch ? mealMap[dailyLog.meal_lunch] : '-'}</p>
                {dailyLog.meal_breakfast && (
                  <p className="text-[10px] text-orange-700 font-medium mt-1">Esmorzar: {mealMap[dailyLog.meal_breakfast]}</p>
                )}
              </div>

              {/* 2. Migdiada (Menta) */}
              <div className="flex flex-col rounded-[24px] bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-emerald-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800">
                    <Moon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-700">Migdiada</span>
                </div>
                <p className="text-sm font-black leading-tight">
                  {dailyLog.nap_start && dailyLog.nap_end ? 'Ha dormit' : 'No ha dormit'}
                </p>
                {dailyLog.nap_start && dailyLog.nap_end && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">
                    {dailyLog.nap_start.substring(0,5)} - {dailyLog.nap_end.substring(0,5)}
                  </p>
                )}
              </div>

              {/* 3. Bolquer (Mostaza) */}
              <div className="flex flex-col rounded-[24px] bg-amber-50/90 border border-amber-200/80 p-3.5 text-amber-950 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
                    <Droplets className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-700">Bolquer</span>
                </div>
                <p className="text-base font-black leading-tight">{dailyLog.diaper_changes} canvis</p>
                {dailyLog.diaper_type && (
                  <p className="text-[10px] text-amber-700 font-medium mt-1">{diaperMap[dailyLog.diaper_type]}</p>
                )}
              </div>

            </div>

            {/* Propers Esdeveniments */}
            <div className="space-y-2 pt-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-400 px-1">
                Accessos directes
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="w-full h-12 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-teal-700" />
                  <span>Contactar</span>
                </button>
                {dailyLog.photos && dailyLog.photos.length > 0 && (
                   <button
                    type="button"
                    className="w-full h-12 rounded-[20px] border border-stone-200/80 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <span>Veure {dailyLog.photos.length} fotos</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </main>
  )
}
