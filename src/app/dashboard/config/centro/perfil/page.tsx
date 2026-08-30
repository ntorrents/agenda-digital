import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { StaffProfileForm } from '@/components/dashboard/StaffProfileForm'
import { getTranslations } from 'next-intl/server'

export default async function DashboardConfigPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email, phone')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const t = await getTranslations('dashboardCentro')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/config/centro"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-indigo-600" /> {t('hubProfileTitle')}
          </h3>
          <p className="text-xs text-stone-500 mt-1">{t('hubProfileDesc')}</p>
        </div>
      </div>

      <StaffProfileForm
        profile={{
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
        }}
      />
    </div>
  )
}
