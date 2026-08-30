import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

export default async function NotaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: guardianRel } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', user.id)
    .limit(1)
    .single()

  if (!guardianRel) redirect('/login')

  const { data: notes } = await supabase
    .from('daily_logs')
    .select('id, date, notes, teacher:profiles!teacher_id(full_name)')
    .eq('student_id', guardianRel.student_id)
    .not('notes', 'is', null)
    .order('date', { ascending: false })

  return (
    <main className="max-w-md mx-auto pt-6 pb-12 px-4 space-y-6">
      
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" /> Històric de Notes
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Totes les anotacions de les educadores.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!notes || notes.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No hi ha notes</h3>
            <p className="text-xs text-stone-500 mt-1">Encara no s'han afegit anotacions diàries per a aquest alumne.</p>
          </div>
        ) : (
          notes.map(note => {
            const dateObj = new Date(note.date)
            const dateStr = dateObj.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'short' })

            const teacher = Array.isArray(note.teacher) ? note.teacher[0] : note.teacher

            return (
              <div key={note.id} className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                    <CalendarIcon className="h-3.5 w-3.5" /> {dateStr}
                  </span>
                  <Link href={`/mi-hijo/agenda?date=${note.date}`} replace={true} scroll={false} className="text-[10px] font-bold text-stone-400 hover:text-stone-600 underline">
                    Veure agenda completa
                  </Link>
                </div>
                {note.notes.split('\n\nNota General: ')[0].trim() && (
                  <p className="text-sm font-semibold text-stone-800 leading-relaxed italic">
                    "{note.notes.split('\n\nNota General: ')[0].trim()}"
                  </p>
                )}
                {note.notes.includes('\n\nNota General: ') && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Nota General de l'Aula</p>
                    <p className="text-sm font-medium text-stone-700 italic">
                       "{note.notes.split('\n\nNota General: ')[1].trim()}"
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 text-xs font-bold text-stone-400">
                  <span>— {teacher?.full_name || 'Educadora'}</span>
                </div>
                
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-300"></div>
              </div>
            )
          })
        )}
      </div>

    </main>
  )
}
