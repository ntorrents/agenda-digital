export type PhotoItem = {
  url: string
  date: string
  type: 'individual' | 'group'
}

export function photosFromDailyLog(log: { date: string; photos?: string[] | null }): PhotoItem[] {
  return (log.photos || [])
    .filter(Boolean)
    .map(url => ({ url, date: log.date, type: 'individual' as const }))
}

export function photosFromClassNote(note: { date: string; photo_url?: string | null }): PhotoItem[] {
  if (!note.photo_url) return []
  return [{ url: note.photo_url, date: note.date, type: 'group' }]
}
