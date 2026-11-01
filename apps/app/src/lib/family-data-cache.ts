/**
 * Caché cliente de datos calientes de familia (agenda, etc.).
 * Stale-while-revalidate: pintar al instante, refrescar en background.
 * No guardar PII sensible (tokens); solo payload ya visible en UI.
 */

import type { FamilyAgendaPayload } from '@/app/actions/family-agenda'

const AGENDA_PREFIX = 'petitdiari:data:family-agenda:'
/** 30 min — hoy cambia poco tras publicar; al abrir se revalida si hace falta */
const AGENDA_TTL_MS = 30 * 60 * 1000

export const FAMILY_AGENDA_DEDUP_MS = 5 * 60 * 1000

export function familyAgendaKey(studentId: string, dateStr: string) {
  return ['family-agenda', studentId, dateStr] as const
}

type CachedAgenda = {
  studentId: string
  dateStr: string
  payload: FamilyAgendaPayload
  at: number
  /** true si un prefetch/revalidate ya terminó OK en esta sesión de datos */
  fresh: boolean
}

function storageKey(studentId: string, dateStr: string) {
  return `${AGENDA_PREFIX}${studentId}:${dateStr}`
}

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

export function readFamilyAgendaCache(
  studentId: string,
  dateStr: string
): CachedAgenda | null {
  const data = readJson<CachedAgenda>(storageKey(studentId, dateStr))
  if (!data || data.studentId !== studentId || data.dateStr !== dateStr) return null
  if (Date.now() - data.at > AGENDA_TTL_MS) return null
  return data
}

export function writeFamilyAgendaCache(
  studentId: string,
  dateStr: string,
  payload: FamilyAgendaPayload,
  fresh = true
) {
  writeJson(storageKey(studentId, dateStr), {
    studentId,
    dateStr,
    payload,
    at: Date.now(),
    fresh,
  } satisfies CachedAgenda)
}

export function markFamilyAgendaFresh(studentId: string, dateStr: string) {
  const cur = readFamilyAgendaCache(studentId, dateStr)
  if (!cur) return
  writeFamilyAgendaCache(studentId, dateStr, cur.payload, true)
}

export function clearFamilyDataCaches() {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k?.startsWith(AGENDA_PREFIX)) keys.push(k)
    }
    keys.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}

export function emptyFamilyAgendaPayload(
  partial?: Partial<FamilyAgendaPayload>
): FamilyAgendaPayload {
  return {
    studentName: partial?.studentName ?? '',
    dailyLog: partial?.dailyLog ?? null,
    globalNote: partial?.globalNote ?? null,
    globalNotePhoto: partial?.globalNotePhoto ?? null,
    settings: partial?.settings ?? {},
    isFuture: partial?.isFuture ?? false,
  }
}
