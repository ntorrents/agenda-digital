import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, School as SchoolIcon, Calendar, Sparkles, ArrowRight } from 'lucide-react'

export default async function DashboardSummaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find school for this admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  const schoolId = profile.school_id

  // 1. Total Students
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  // 2. Active Classrooms
  const { count: classroomCount } = await supabase
    .from('classrooms')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('is_active', true)
    
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('name')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .limit(2)

  const classroomNames = classrooms?.map(c => c.name).join(' & ') || ''

  // 3. Today's Logs (Agendas)
  const todayDateStr = new Date().toISOString().split('T')[0]
  const { count: logCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)

  const totalS = studentCount || 0
  const totalL = logCount || 0
  const missingLogs = totalS - totalL

  const todayFormatted = new Date().toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-100 text-xs font-semibold capitalize">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" /> {todayFormatted}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bon dia! 👋
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 font-normal max-w-lg">
              Tot el centre en marxa. Tens {totalS} alumnes registrats a les aules avui.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Link
              href="/mi-aula"
              className="inline-flex items-center justify-center rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm h-11 px-5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Veure com a Educadora <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Alumnes Inscrits</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">{totalS}</h3>
          </div>
        </div>

        <Link href="/dashboard/aulas">
          <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-4 ring-orange-50/50 shrink-0">
              <SchoolIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Aules Actives</p>
              <h3 className="text-2xl font-black text-stone-800 mt-0.5">{classroomCount || 0} Aules</h3>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5 truncate max-w-[150px]">{classroomNames}</p>
            </div>
          </div>
        </Link>

        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Agendes del Dia</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">{totalL} / {totalS}</h3>
            {missingLogs === 0 && totalS > 0 ? (
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">● Tot completat</p>
            ) : (
              <p className="text-[11px] text-amber-600 font-bold mt-0.5">● {missingLogs} pendents</p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
