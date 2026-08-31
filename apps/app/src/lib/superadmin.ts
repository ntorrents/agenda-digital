import { requireSuperadmin } from '@/lib/superadmin-auth'

/** Verifica superadmin i retorna client admin (bypass RLS). */
export async function getSuperadminDb() {
  const { admin } = await requireSuperadmin()
  return admin
}
