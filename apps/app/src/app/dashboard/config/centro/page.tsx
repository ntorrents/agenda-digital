import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings, Building2, UserCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function DashboardConfigCentroHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, schools(name)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  const school = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools
  const t = await getTranslations('dashboardCentro')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" /> {t('hubTitle')}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{t('subtitle', { name: school?.name || '' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/config/centro/escola"
          className="group bg-white border border-stone-200/80 rounded-[24px] p-6 hover:shadow-lg hover:border-stone-300 transition-all"
        >
          <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-black text-stone-900 mb-1">{t('hubSchoolTitle')}</h4>
          <p className="text-sm text-stone-500 font-medium">{t('hubSchoolDesc')}</p>
        </Link>
        <Link
          href="/dashboard/config/centro/perfil"
          className="group bg-white border border-stone-200/80 rounded-[24px] p-6 hover:shadow-lg hover:border-stone-300 transition-all"
        >
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <UserCircle className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-black text-stone-900 mb-1">{t('hubProfileTitle')}</h4>
          <p className="text-sm text-stone-500 font-medium">{t('hubProfileDesc')}</p>
        </Link>
      </div>
    </div>
  )
}
