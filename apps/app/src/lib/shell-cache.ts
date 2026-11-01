/**
 * Caché ligera del shell (nombre, logo, rol) en sessionStorage.
 * Acelera el primer pintado del layout; siempre se revalida en background.
 * No guardar datos sensibles (tokens, passwords).
 */

export type FamilyShellCache = {
  userId: string
  fullName: string
  schoolName: string | null
  logoUrl: string | null
  at: number
}

export type DashboardShellCache = {
  userId: string
  fullName: string
  role: string
  schoolName: string | null
  logoUrl: string | null
  at: number
}

const FAMILY_KEY = 'petitdiari:shell:family'
const DASHBOARD_KEY = 'petitdiari:shell:dashboard'
/** 12 h — logo/nombre/rol cambian poco */
const TTL_MS = 12 * 60 * 60 * 1000

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / private mode
  }
}

function isFresh(at: number) {
  return Date.now() - at < TTL_MS
}

/** Lectura síncrona sin userId — hidratar shell en el primer paint. */
export function peekFamilyShellCache(): FamilyShellCache | null {
  const data = readJson<FamilyShellCache>(FAMILY_KEY)
  if (!data || !isFresh(data.at)) return null
  return data
}

export function readFamilyShellCache(userId: string): FamilyShellCache | null {
  const data = peekFamilyShellCache()
  if (!data || data.userId !== userId) return null
  return data
}

export function writeFamilyShellCache(data: Omit<FamilyShellCache, 'at'>) {
  writeJson(FAMILY_KEY, { ...data, at: Date.now() })
}

/** Lectura síncrona sin userId — hidratar shell dashboard en el primer paint. */
export function peekDashboardShellCache(): DashboardShellCache | null {
  const data = readJson<DashboardShellCache>(DASHBOARD_KEY)
  if (!data || !isFresh(data.at)) return null
  return data
}

export function readDashboardShellCache(userId: string): DashboardShellCache | null {
  const data = peekDashboardShellCache()
  if (!data || data.userId !== userId) return null
  return data
}

export function writeDashboardShellCache(data: Omit<DashboardShellCache, 'at'>) {
  writeJson(DASHBOARD_KEY, { ...data, at: Date.now() })
}

export function clearShellCaches() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(FAMILY_KEY)
    sessionStorage.removeItem(DASHBOARD_KEY)
  } catch {
    // ignore
  }
}
