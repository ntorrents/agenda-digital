import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { StaffProfileForm } from '@/components/dashboard/StaffProfileForm'
import { getTranslations } from 'next-intl/server'

export default async function DashboardParametresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email, phone')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'auxiliary')) {
    redirect('/dashboard')
  }

  const t = await getTranslations('dashboardParametres')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" /> {t('title')}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <StaffProfileForm profile={profile} />
    </div>
  )
}
