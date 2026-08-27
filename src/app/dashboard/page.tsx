import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, Sparkles, ArrowRight, ShieldAlert, HeartPulse, Activity } from 'lucide-react'

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
  const todayDateStr = new Date().toISOString().split('T')[0]

  // 1. Total Students
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('is_active', true)

  const totalS = studentCount || 0

  // 2. Today's Logs (Student Attendance approximation)
  const { count: logCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)

  const totalL = logCount || 0
  const missingLogs = totalS - totalL
  const studentAttendanceRate = totalS > 0 ? Math.round((totalL / totalS) * 100) : 0

  // 3. Staff Attendance
  const { count: staffTotal } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('role', ['teacher', 'admin'])
    .eq('is_active', true)

  const { data: staffAbsences } = await supabase
    .from('staff_attendance')
    .select('id, profiles(full_name), status')
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)
    .in('status', ['absent', 'sick'])

  const staffAbsentCount = staffAbsences?.length || 0
  const staffPresentCount = (staffTotal || 0) - staffAbsentCount

  // 4. Intolerances Quick Alert
  const { data: intolerantStudents } = await supabase
    .from('students')
    .select('id, first_name, last_name, intolerances, classrooms(name)')
    .eq('school_id', schoolId)
    .not('intolerances', 'is', null)
    .neq('intolerances', '')

  const todayFormatted = new Date().toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="px-4 sm:px-8 pt-6 pb-12 space-y-6">
      
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-100 text-xs font-semibold capitalize">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" /> {todayFormatted}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Panell d&apos;Activitat 👋
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 font-normal max-w-lg">
              Resum d&apos;activitat, assistència i alertes del dia per a la direcció del centre.
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

      {/* Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* KPI Alumnos Asistencia */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Assistència Alumnes</p>
            <div className="flex items-end gap-2 mt-0.5">
              <h3 className="text-2xl font-black text-stone-800 leading-none">{studentAttendanceRate}%</h3>
              <span className="text-[11px] font-bold text-stone-500 mb-1">({totalL}/{totalS} agendes)</span>
            </div>
          </div>
        </div>

        {/* KPI Personal Asistencia */}
        <Link href="/dashboard/config/personal">
          <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-4 shrink-0 ${staffAbsentCount > 0 ? 'bg-red-50 text-red-600 ring-red-50/50' : 'bg-emerald-50 text-emerald-600 ring-emerald-50/50'}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Salut de l&apos;Equip</p>
              <h3 className="text-2xl font-black text-stone-800 mt-0.5">{staffPresentCount} <span className="text-sm font-bold text-stone-400">/ {staffTotal} Actius</span></h3>
              {staffAbsentCount > 0 ? (
                <p className="text-[11px] text-red-600 font-bold mt-0.5">● {staffAbsentCount} de baixa/absents</p>
              ) : (
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">● Tot l&apos;equip complet</p>
              )}
            </div>
          </div>
        </Link>

        {/* KPI Agendas */}
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Agendes Pendents</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">{missingLogs}</h3>
            {missingLogs === 0 && totalS > 0 ? (
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">● Cap pendent</p>
            ) : (
              <p className="text-[11px] text-amber-600 font-bold mt-0.5">● Cal revisar aules</p>
            )}
          </div>
        </div>
      </div>

      {/* Alertas y Alumnos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alertas Intolerancias */}
        <div className="bg-white border border-stone-200/80 rounded-[28px] overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-50 text-rose-600 flex items-center justify-center rounded-2xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">Al·lèrgies i Intoleràncies</h3>
              <p className="text-[11px] text-stone-500 font-medium">Alumnes actius que requereixen atenció</p>
            </div>
          </div>
          <div className="p-3 divide-y divide-stone-100 max-h-[300px] overflow-y-auto no-scrollbar">
            {intolerantStudents?.map((student: any) => (
              <div key={student.id} className="p-3 hover:bg-stone-50/50 transition-colors rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{student.first_name} {student.last_name}</p>
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">
                      {student.classrooms ? (Array.isArray(student.classrooms) ? student.classrooms[0]?.name : student.classrooms.name) : 'Sense aula'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 bg-rose-50/50 border border-rose-100 p-2 rounded-lg">
                  <p className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
                    <HeartPulse className="h-3 w-3 shrink-0" />
                    {student.intolerances}
                  </p>
                </div>
              </div>
            ))}
            {intolerantStudents?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-stone-500 font-medium">No hi ha alumnes amb al·lèrgies registrades.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bajas de Personal hoy */}
        <div className="bg-white border border-stone-200/80 rounded-[28px] overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-stone-100 flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 flex items-center justify-center rounded-2xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">Absències d&apos;Equip</h3>
              <p className="text-[11px] text-stone-500 font-medium">Personal de baixa o absent avui</p>
            </div>
          </div>
          <div className="p-3 divide-y divide-stone-100 max-h-[300px] overflow-y-auto no-scrollbar">
            {staffAbsences?.map((absence: any) => (
              <div key={absence.id} className="p-3 hover:bg-stone-50/50 transition-colors rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-stone-900">{Array.isArray(absence.profiles) ? absence.profiles[0]?.full_name : absence.profiles?.full_name}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${absence.status === 'absent' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {absence.status === 'absent' ? 'Absent' : 'Malaltia'}
                </span>
              </div>
            ))}
            {staffAbsences?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-stone-500 font-medium">Tot el personal està actiu avui.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
