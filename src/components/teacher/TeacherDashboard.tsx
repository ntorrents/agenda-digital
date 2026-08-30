import { createClient } from '@/lib/supabase/server'
import { Baby, Calendar, CheckCircle2, AlertCircle, Building2, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export async function TeacherDashboard({ schoolId, userId }: { schoolId: string, userId: string }) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Find the classroom assigned to this teacher
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('teacher_id', userId)
    .single()

  let totalStudents = 0
  let agendasCompleted = 0

  if (classroom) {
    // 2. Count students in this classroom
    const { count: studentCount } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id)
      .eq('status', 'active')
    
    totalStudents = studentCount || 0

    // 3. Count completed agendas for today in this classroom
    const { count: agendasCount } = await supabase
      .from('daily_logs')
      .select('id', { count: 'exact', head: true })
      .eq('date', today)
      .in('student_id', (
        await supabase.from('students').select('id').eq('classroom_id', classroom.id).eq('status', 'active')
      ).data?.map(s => s.id) || [])
      
    agendasCompleted = agendasCount || 0
  }

  const allAgendasDone = totalStudents > 0 && agendasCompleted >= totalStudents
  const agendasPending = Math.max(0, totalStudents - agendasCompleted)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-100 text-xs font-semibold capitalize">
              {new Date().toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bon dia, Educador/a 👋
            </h2>
            <p className="text-sm text-indigo-100/90 font-medium max-w-lg">
              Aquest és el teu resum d'avui. Prepara l'aula i mantingues a les famílies informades.
            </p>
          </div>
        </div>
      </div>

      {!classroom ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-bold">Encara no tens cap aula assignada</h3>
            <p className="text-sm mt-1">Parla amb direcció perquè t'assignin com a tutor/a d'un aula per començar a gestionar els teus alumnes.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Alumnos Card */}
          <div className="bg-white border border-stone-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">La teva Aula</p>
                <h3 className="text-2xl font-black text-stone-900">{classroom.name}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-stone-600">
                  <Baby className="h-5 w-5 text-indigo-500" />
                  <span>{totalStudents} alumnes actius</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <Link href="/dashboard/config/alumnos" className="mt-6 flex items-center justify-center w-full bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 rounded-xl border border-stone-200 transition-colors">
              Veure els meus alumnes
            </Link>
          </div>

          {/* Agendas Card */}
          <div className="bg-white border border-stone-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Estat de les Agendes</p>
                <h3 className="text-2xl font-black text-stone-900">{agendasCompleted} / {totalStudents}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                  {allAgendasDone ? (
                    <span className="text-teal-600 flex items-center gap-1"><CheckCircle2 className="h-5 w-5" /> Totes al dia!</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="h-5 w-5" /> Faltan {agendasPending} per omplir</span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Link href="/dashboard/agendas" className="mt-6 flex items-center justify-center w-full bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 rounded-xl border border-stone-200 transition-colors">
              Omplir Agendes
            </Link>
          </div>

        </div>
      )}

    </div>
  )
}
