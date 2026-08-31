/** Centre de demostració per presentacions (dades fictícies, correus @escola-demo.invalid) */

const DEMO_SCHOOL_ID = 'a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0'
const DEMO_SLUG = 'demo-showcase'

export function isDemoSchool(settings: unknown, schoolId?: string): boolean {
  if (schoolId === DEMO_SCHOOL_ID) return true
  const s = settings as { demo?: { showcase?: boolean }; ops?: { demo_school?: boolean } } | null
  return !!(s?.demo?.showcase || s?.ops?.demo_school)
}

export function isDemoShowcaseEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith('@escola-demo.invalid')
}

export const DEMO_SCHOOL_META = {
  id: DEMO_SCHOOL_ID,
  slug: DEMO_SLUG,
  name: 'DEMO — Escola Bressol La Ginesta',
  directorEmail: 'directora@escola-demo.invalid',
  defaultPassword: 'Demo-Petit2026!',
} as const
