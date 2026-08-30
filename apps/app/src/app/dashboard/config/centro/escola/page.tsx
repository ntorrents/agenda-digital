import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { SchoolSettingsForm } from '@/components/admin/SchoolSettingsForm'
import { MassAccessSender } from '@/components/admin/MassAccessSender'
import { getTranslations } from 'next-intl/server'

export default async function DashboardConfigEscolaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, schools(*)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.schools) redirect('/dashboard')

  const schoolData = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools

  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolData.id)
    .eq('status', 'active')

  const { count: teacherCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolData.id)
    .in('role', ['teacher', 'admin', 'auxiliary'])
    .eq('status', 'active')

  const t = await getTranslations('dashboardCentro')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/config/centro"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" /> {t('hubSchoolTitle')}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{schoolData.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('activeStudents')}</p>
              <h3 className="text-2xl font-black text-stone-800 mt-1">{studentCount || 0}</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('activeTeam')}</p>
              <h3 className="text-2xl font-black text-stone-800 mt-1">{teacherCount || 0}</h3>
            </div>
          </div>
          <SchoolSettingsForm initialSettings={schoolData.settings || {}} schoolInfo={schoolData} />
        </div>
        <div>
          <MassAccessSender />
        </div>
      </div>
    </div>
  )
}
