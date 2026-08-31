import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

/** Verifica superadmin i retorna client admin (bypass RLS). */
export async function requireSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const metaRole = user.app_metadata?.role as string | undefined
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, force_password_reset')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || metaRole
  if (role !== 'superadmin') redirect('/login')

  if (profile?.force_password_reset) redirect('/force-password-reset')

  return { admin: createAdminClient(), actorId: user.id }
}
