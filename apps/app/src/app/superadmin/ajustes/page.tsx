import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import { Locale } from '@/i18n'
import { SuperadminSettingsClient } from '@/components/superadmin/SuperadminSettingsClient'

export default async function SuperadminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = (await getLocale()) as Locale

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .maybeSingle()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Ajustos</h2>
        <p className="text-stone-500 text-sm mt-1">Compte, idioma i preferències del panell superadmin.</p>
      </div>
      <SuperadminSettingsClient
        currentLocale={locale}
        email={user!.email || ''}
        fullName={profile?.full_name ?? null}
      />
    </div>
  )
}
