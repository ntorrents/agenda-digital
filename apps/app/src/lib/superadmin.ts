import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

/** Verifica que l'usuari és superadmin i retorna un client amb accés total (bypass RLS). */
export async function getSuperadminDb() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const metaRole = user.app_metadata?.role as string | undefined
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || metaRole
  if (role !== 'superadmin') redirect('/login')

  try {
    return createAdminClient()
  } catch {
    return supabase
  }
}
