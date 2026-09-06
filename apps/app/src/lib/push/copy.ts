/** Textos de les notificacions push (fàcil d’editar). */
export const PUSH_COPY = {
  agenda: {
    title: 'Agenda disponible',
  },
  announcement: {
    title: 'Nou avís',
  },
  menu: {
    titleCreate: 'Nou menú del menjador',
    titleUpdate: 'Menú del menjador actualitzat',
  },
  message: {
    title: 'Nou missatge',
  },
} as const

/** Helper per apostrofar correctament en català (de / d') */
function de(nom: string): string {
  const trimmed = nom.trim()
  if (!trimmed) return 'de '
  const needsApostrophe = /^[aeiouhàèéíïòóúüAEIOUHÀÈÉÍÏÒÓÚÜ]/.test(trimmed)
  return needsApostrophe ? `d'${trimmed}` : `de ${trimmed}`
}

const MESOS = [
  'gener',
  'febrer',
  'març',
  'abril',
  'maig',
  'juny',
  'juliol',
  'agost',
  'setembre',
  'octubre',
  'novembre',
  'desembre',
] as const

/** `2026-09-06` → `6 de setembre de 2026` */
export function formatDateCa(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (!m) return dateStr
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const nomMes = MESOS[month - 1]
  if (!nomMes) return dateStr
  return `${day} ${de(nomMes)} de ${year}`
}

export function agendaBody(studentLabel: string, dateStr: string) {
  return `Ja pots consultar l'agenda ${de(studentLabel)} (${formatDateCa(dateStr)}).`
}

export function menuBody(title: string | null | undefined, month: number, year: number) {
  const trimmed = title?.trim()
  if (trimmed) return trimmed
  const nomMes = MESOS[month - 1] ?? String(month).padStart(2, '0')
  return `Menú ${de(nomMes)} de ${year} disponible.`
}

export function messageBody(content: string) {
  const text = content.trim().replace(/\s+/g, ' ')
  if (text.length <= 120) return text
  return `${text.slice(0, 117)}…`
}
