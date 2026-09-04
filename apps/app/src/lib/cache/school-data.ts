import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export function diningMenuTag(schoolId: string, year: number, month: number) {
  return `dining-menu:${schoolId}:${year}-${month}`
}

export function schoolSettingsTag(schoolId: string) {
  return `school-settings:${schoolId}`
}

/**
 * Menú mensual por centro — dato compartido, poco cambiante.
 * Llamar solo tras resolver schoolId desde la sesión del usuario.
 */
export function getCachedDiningMenu(schoolId: string, year: number, month: number) {
  return unstable_cache(
    async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('dining_menus')
        .select('*')
        .eq('school_id', schoolId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()
      return data
    },
    ['dining-menu', schoolId, String(year), String(month)],
    { revalidate: 3600, tags: [diningMenuTag(schoolId, year, month)] }
  )()
}

/**
 * Settings del centro (toggles agenda, etc.).
 * Llamar solo tras resolver schoolId desde la sesión del usuario.
 */
export function getCachedSchoolSettings(schoolId: string) {
  return unstable_cache(
    async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('schools')
        .select('settings')
        .eq('id', schoolId)
        .single()
      return (data?.settings ?? {}) as Record<string, unknown>
    },
    ['school-settings', schoolId],
    { revalidate: 3600, tags: [schoolSettingsTag(schoolId)] }
  )()
}
