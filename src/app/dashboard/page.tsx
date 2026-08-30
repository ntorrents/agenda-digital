import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Baby, Users, Building2, Settings, ChevronRight, Sparkles, Calendar, ShieldAlert, HeartPulse, Activity, LayoutDashboard, MessageSquare } from 'lucide-react'
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard'
import { getTranslations } from 'next-intl/server'

export default async function DashboardSummaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find school for this admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
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
    .eq('status', 'active')

  const totalS = studentCount || 0

  // 2. Total Staff
  const { count: staffTotal } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('role', ['teacher', 'admin'])
    .eq('status', 'active')

  const totalTeachers = staffTotal || 0

  // 3. Classrooms
  const { count: classCount } = await supabase
    .from('classrooms')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const totalClassrooms = classCount || 0

  // 4. Today's Logs (Agendas)
  const { count: logCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)

  const missingLogs = totalS - (logCount || 0)

  // 5. Staff Absences today
  const { data: staffAbsences } = await supabase
    .from('staff_attendance')
    .select('id, profiles(full_name), status')
    .eq('school_id', schoolId)
    .eq('date', todayDateStr)
    .in('status', ['absent', 'sick'])

  // 6. Intolerances
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

  const t = await getTranslations('dashboardAdmin')

  // Quick Action Config Cards
  const cards = [
    {
      title: t('cards.students.title'),
      description: t('cards.students.desc'),
      icon: Baby,
      href: '/dashboard/config/alumnos',
      color: 'teal',
      stat: `${totalS} ${t('cards.students.stat')}`
    },
    {
      title: t('cards.staff.title'),
      description: t('cards.staff.desc'),
      icon: Users,
      href: '/dashboard/config/equipo',
      color: 'amber',
      stat: `${totalTeachers} ${t('cards.staff.stat')}`
    },
    {
      title: t('cards.classrooms.title'),
      description: t('cards.classrooms.desc'),
      icon: Building2,
      href: '/dashboard/config/aulas',
      color: 'orange',
      stat: `${totalClassrooms} ${t('cards.classrooms.stat')}`
    },
    {
      title: t('cards.settings.title'),
      description: t('cards.settings.desc'),
      icon: Settings,
      href: '/dashboard/config/centro',
      color: 'indigo',
      stat: null
    }
  ]

  // If the user is a teacher, render their specific dashboard instead of the admin one
  if (profile.role === 'teacher') {
    return (
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <TeacherDashboard schoolId={schoolId} userId={user.id} />
      </main>
    )
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-100 text-xs font-semibold capitalize">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" /> {todayFormatted}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('welcome')}
            </h2>
            <p className="text-sm text-teal-100/90 font-medium max-w-lg">
              {t('welcomeDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Main KPIs (Config Cards as requested by user) */}
      <section>
        <h3 className="text-lg font-black text-stone-800 mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-stone-400" /> {t('kpiTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <Link 
              key={idx} 
              href={card.href}
              className="group block bg-white border border-stone-200/80 rounded-[24px] p-5 hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-300 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${card.color}-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none`} />
              
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${card.color}-100 text-${card.color}-600 shadow-sm shadow-${card.color}-500/10`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  {card.stat && (
                    <span className={`px-2.5 py-1 rounded-lg bg-${card.color}-50 text-${card.color}-700 text-[10px] font-black uppercase tracking-wider border border-${card.color}-100`}>
                      {card.stat}
                    </span>
                  )}
                </div>
                
                <h3 className="text-base font-black text-stone-800 mb-1 group-hover:text-stone-900">
                  {card.title}
                </h3>
                
                <p className="text-xs text-stone-500 font-medium leading-relaxed flex-1">
                  {card.description}
                </p>
                
                <div className="mt-4 flex items-center text-[11px] font-bold text-stone-400 group-hover:text-stone-900 transition-colors uppercase tracking-wider">
                  {t('configure')} <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Activity Alerts (The old KPIs converted to alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Agendas Pendientes */}
        <Link 
          href="/dashboard/agendas"
          className="group block bg-white border border-stone-200/80 rounded-[24px] p-5 shadow-xs hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-300 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-stone-800">{t('alerts.agendas.title')}</h3>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex items-end gap-2">
              <h4 className="text-3xl font-black text-stone-900 leading-none">{missingLogs}</h4>
              <span className="text-xs font-bold text-stone-500 mb-1">{t('alerts.agendas.pending')}</span>
            </div>
            {missingLogs === 0 && totalS > 0 ? (
               <p className="text-[11px] text-emerald-600 font-bold mt-2">{t('alerts.agendas.allDone')}</p>
            ) : (
               <p className="text-[11px] text-amber-600 font-bold mt-2">{t('alerts.agendas.needReview')}</p>
            )}
          </div>
        </Link>

        {/* Absences */}
        <div className="bg-white border border-stone-200/80 rounded-[24px] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 bg-rose-50 text-rose-600 flex items-center justify-center rounded-xl">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-stone-800">{t('alerts.absences.title')}</h3>
          </div>
          <div className="flex items-end gap-2">
            <h4 className="text-3xl font-black text-stone-900 leading-none">{staffAbsences?.length || 0}</h4>
            <span className="text-xs font-bold text-stone-500 mb-1">{t('alerts.absences.today')}</span>
          </div>
          {(staffAbsences?.length || 0) === 0 ? (
             <p className="text-[11px] text-emerald-600 font-bold mt-2">{t('alerts.absences.allOk')}</p>
          ) : (
             <p className="text-[11px] text-rose-600 font-bold mt-2 line-clamp-1 truncate">
               ● {staffAbsences?.map((a: any) => Array.isArray(a.profiles) ? a.profiles[0]?.full_name : a.profiles?.full_name).join(', ')}
             </p>
          )}
        </div>

        {/* Intolerances */}
        <div className="bg-white border border-stone-200/80 rounded-[24px] p-5 shadow-xs flex flex-col max-h-[160px]">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black text-stone-800">{t('alerts.intolerances.title')}</h3>
            </div>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-lg">
              {intolerantStudents?.length || 0} {t('alerts.intolerances.students')}
            </span>
          </div>
          <div className="overflow-y-auto no-scrollbar flex-1 pr-2 space-y-2">
            {intolerantStudents?.map((student: any) => (
              <div key={student.id} className="bg-stone-50 rounded-lg p-2 text-xs flex justify-between items-center">
                <span className="font-bold text-stone-800 truncate mr-2">{student.first_name} {student.last_name}</span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                  {student.intolerances}
                </span>
              </div>
            ))}
            {intolerantStudents?.length === 0 && (
              <p className="text-xs text-stone-500 font-medium">{t('alerts.intolerances.none')}</p>
            )}
          </div>
        </div>

      </div>

    </main>
  )
}
