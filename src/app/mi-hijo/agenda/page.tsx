import { Utensils, Moon, Droplets, Smile, Calendar, MessageCircle, ImageIcon, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function FamilyAgendaPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  let dailyLog = null
  let studentName = ''
  let settings = {}

  if (guardianRel) {
    const studentId = guardianRel.student_id

    const { data: student } = await supabase
      .from('students')
      .select('first_name, classroom_id')
      .eq('id', studentId)
      .single()

    studentName = student?.first_name || ''

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

    let globalNote = null
    if (log && student?.classroom_id) {
      const { data: gn } = await supabase
        .from('classroom_daily_notes')
        .select('note, photo_url')
        .eq('classroom_id', student.classroom_id)
        .eq('date', dateStr)
        .maybeSingle()
      if (gn) {
        globalNote = gn.note
        dailyLog.globalNotePhoto = gn.photo_url
      }
    }

    dailyLog.globalNote = globalNote

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()
      
    if (profile?.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', profile.school_id)
        .single()
      settings = school?.settings || {}
    }
  }

  const selectedDate = new Date(dateStr)
  selectedDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isFuture = selectedDate.getTime() > today.getTime()

  const mealMap: Record<string, string> = {
    all: 'Tot',
    most: 'Gairebé tot',
    little: 'Poc',
    none: 'Res'
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
    <main className="max-w-md mx-auto pt-4 pb-8 space-y-5 px-4">
      
      <div className="space-y-5">
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
            {/* Fotos (Mini carrusel) */}
            {dailyLog.photos && dailyLog.photos.length > 0 && (
              <div className="bg-white border border-stone-200/60 rounded-[28px] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-[11px] font-black uppercase text-stone-400 flex items-center gap-1.5 tracking-wider">
                    <ImageIcon className="h-3.5 w-3.5" /> Galeria del dia
                  </h3>
                  <Link href={`/mi-hijo/galeria`} className="text-[11px] text-teal-600 font-bold flex items-center">
                    Veure tot <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
                  {dailyLog.photos.map((photo: string, index: number) => (
                    <Link href={`/mi-hijo/galeria`} key={index} className="shrink-0 snap-start">
                      <div className="relative h-16 w-16 rounded-[16px] overflow-hidden border border-stone-100">
                        {/* Placeholder visual por ahora. En produccion usariamos next/image con el src real */}
                        <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-[10px] text-stone-400">
                          Foto {index + 1}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Alimentación */}
            {settings.agenda_food !== false && (
            <div className="bg-[#8cc63f]/10 border border-[#8cc63f]/30 rounded-[28px] p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#8cc63f] text-white p-1.5 rounded-xl">
                  <Utensils className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-[#6b992f] uppercase tracking-wider">Alimentació</h3>
              </div>

              <div className="space-y-3">
                {dailyLog.meal_breakfast && (
                  <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                    <span className="text-xs font-bold text-stone-700">Esmorzar</span>
                    <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                      {mealMap[dailyLog.meal_breakfast]}
                    </span>
                  </div>
                )}
                {dailyLog.meal_lunch && (
                  <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                    <span className="text-xs font-bold text-stone-700">Dinar</span>
                    <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                      {mealMap[dailyLog.meal_lunch]}
                    </span>
                  </div>
                )}
                {dailyLog.meal_snack && (
                  <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                    <span className="text-xs font-bold text-stone-700">Berenar</span>
                    <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                      {mealMap[dailyLog.meal_snack]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Fisiológico y Siesta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Siesta */}
              {settings.agenda_nap !== false && (
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-[24px] p-4 shadow-xs">
                <div className="flex items-center gap-1.5 mb-2">
                  <Moon className="h-4 w-4 text-emerald-600" />
                  <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">Migdiada</span>
                </div>
                <p className="text-sm font-black text-stone-800">
                  {dailyLog.nap_start && dailyLog.nap_end ? 'Ha dormit' : 'No ha dormit'}
                </p>
                {dailyLog.nap_start && dailyLog.nap_end && (
                  <p className="text-xs font-medium text-stone-500 mt-1">
                    De {dailyLog.nap_start.substring(0,5)} a {dailyLog.nap_end.substring(0,5)}
                  </p>
                )}
              </div>
              )}

              {/* Pañal */}
              {settings.agenda_diaper !== false && (
              <div className="bg-amber-50/80 border border-amber-100 rounded-[24px] p-4 shadow-xs">
                <div className="flex items-center gap-1.5 mb-2">
                  <Droplets className="h-4 w-4 text-amber-600" />
                  <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">Bolquer</span>
                </div>
                <p className="text-sm font-black text-stone-800">
                  {dailyLog.diaper_changes} canvis
                </p>
                {dailyLog.diaper_type && (
                  <p className="text-xs font-medium text-stone-500 mt-1">
                    {diaperMap[dailyLog.diaper_type]}
                  </p>
                )}
              </div>
              )}
            </div>

            {/* Anotaciones Específicas */}
            <div className="bg-white border border-orange-200/50 rounded-[28px] overflow-hidden shadow-xs">
              <div className="bg-orange-400/90 px-4 py-2.5">
                <h3 className="text-[11px] font-black uppercase text-white tracking-wider">Anotacions de l&apos;Educadora</h3>
              </div>
              <div className="p-5 bg-orange-50/30">
                {dailyLog.notes && dailyLog.notes.trim() ? (
                  <p className="text-sm font-bold text-stone-800 leading-relaxed italic">
                    "{dailyLog.notes.trim()}"
                  </p>
                ) : (
                  <p className="text-sm text-stone-400 italic">Sense anotacions avui.</p>
                )}
                
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-600">{dailyLog.teacher?.full_name || 'Educadora'}</span>
                  {dailyLog.mood && settings.agenda_mood !== false && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-100 font-bold text-stone-700">
                      <Smile className="h-3.5 w-3.5 text-amber-500" /> {moodMap[dailyLog.mood]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Anotaciones Globales */}
            {(dailyLog.globalNote || dailyLog.globalNotePhoto) && (
              <div className="bg-white border border-blue-200/50 rounded-[28px] overflow-hidden shadow-xs mt-4">
                <div className="bg-blue-500/90 px-4 py-2.5 flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-white" />
                  <h3 className="text-[11px] font-black uppercase text-white tracking-wider">Nota Global de l'Aula</h3>
                </div>
                <div className="p-5 bg-blue-50/30">
                  <div className="text-sm font-bold text-stone-800 leading-relaxed italic whitespace-pre-wrap">
                    {dailyLog.globalNote && <p className="mb-4">"{dailyLog.globalNote.trim()}"</p>}
                    
                    {dailyLog.globalNotePhoto && (
                      <div className="rounded-xl overflow-hidden shadow-sm border border-stone-200 inline-block mt-2">
                        <img src={dailyLog.globalNotePhoto} alt="Foto Grupal" className="w-full h-auto max-h-64 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


          </>
        )}
      </div>

    </main>
  )
}
