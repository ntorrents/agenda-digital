import type { DiaperType } from '@/types/enums'

export const DEPOSITION_TYPES: DiaperType[] = ['soft', 'normal', 'liquid']

const LEGACY_MAP: Record<string, DiaperType[]> = {
  pee: ['liquid'],
  poo: ['normal'],
  both: ['normal', 'liquid'],
  dry: [],
}

export function parseDiaperTypes(raw: string | null | undefined): DiaperType[] {
  if (!raw) return []
  return raw
    .split(',')
    .map(v => v.trim())
    .filter((v): v is DiaperType => DEPOSITION_TYPES.includes(v as DiaperType))
}

export function formatDiaperTypes(types: DiaperType[]): string | null {
  const unique = [...new Set(types.filter(t => DEPOSITION_TYPES.includes(t)))]
  return unique.length > 0 ? unique.join(',') : null
}

export function normalizeDiaperTypes(raw: string | null | undefined): DiaperType[] {
  const parsed = parseDiaperTypes(raw)
  if (parsed.length > 0) return parsed
  if (raw && LEGACY_MAP[raw]) return LEGACY_MAP[raw]
  return []
}

export function toggleDiaperType(current: DiaperType[], value: DiaperType): DiaperType[] {
  return current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
}
