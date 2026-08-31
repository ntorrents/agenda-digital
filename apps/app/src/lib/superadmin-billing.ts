import { DEFAULT_MONTHLY_PRICE } from '@/lib/superadmin-constants'

type BillingSettings = {
  monthly_price?: number
  /** @deprecated Només per compatibilitat amb dades antigues */
  price_per_student?: number
  notes?: string
}

type SchoolSettingsLike = {
  billing?: BillingSettings
  ops?: { active?: boolean }
} | null

/** Import mensual acordat amb el centre (€/mes, tarifa plana). */
export function getSchoolMonthlyPrice(settings: unknown): number {
  const s = settings as SchoolSettingsLike
  if (typeof s?.billing?.monthly_price === 'number' && s.billing.monthly_price >= 0) {
    return s.billing.monthly_price
  }
  return DEFAULT_MONTHLY_PRICE
}

export function isSchoolBillingActive(settings: unknown): boolean {
  const s = settings as SchoolSettingsLike
  return s?.ops?.active !== false
}

/** MRR del centre: import mensual si el centre està actiu, sinó 0. */
export function getSchoolMrr(settings: unknown): number {
  if (!isSchoolBillingActive(settings)) return 0
  return getSchoolMonthlyPrice(settings)
}

/** Referència informativa: import mensual / alumnes actius. */
export function getEffectivePricePerStudent(monthlyPrice: number, activeStudents: number): number | null {
  if (activeStudents <= 0) return null
  return Math.round((monthlyPrice / activeStudents) * 100) / 100
}
