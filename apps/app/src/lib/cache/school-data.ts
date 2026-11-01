import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export function diningMenuTag(schoolId: string, year: number, month: number) {
  return `dining-menu:${schoolId}:${year}-${month}`
}

export function schoolSettingsTag(schoolId: string) {
  return `school-settings:${schoolId}`
}

export function schoolBrandTag(schoolId: string) {
  return `school-brand:${schoolId}`
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

/**
 * Nombre + logo del centro — shell UI, cambia muy poco.
 * TTL 24h; invalidar con schoolBrandTag al actualizar escuela.
 */
export function getCachedSchoolBrand(schoolId: string) {
  return unstable_cache(
    async () => {
      const admin = createAdminClient()
      const { data } = await admin
        .from('schools')
        .select('name, logo_url')
        .eq('id', schoolId)
        .single()
      return data
        ? { name: data.name as string, logo_url: (data.logo_url as string | null) ?? null }
        : null
    },
    ['school-brand', schoolId],
    { revalidate: 86400, tags: [schoolBrandTag(schoolId)] }
  )()
}
