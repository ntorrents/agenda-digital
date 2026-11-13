export type PhotoItem = {
  url: string
  date: string
  type: 'individual' | 'group'
}

export type ClassNotePhotosSource = {
  date: string
  photo_url?: string | null
  photo_urls?: string[] | null
}

/** Normaliza fotos grupales (array nuevo + photo_url legacy). */
export function classNotePhotoUrls(note: {
  photo_url?: string | null
  photo_urls?: string[] | null
}): string[] {
  const fromArray = (note.photo_urls || []).filter((url): url is string => Boolean(url))
  if (fromArray.length > 0) return fromArray
  return note.photo_url ? [note.photo_url] : []
}

export function photosFromDailyLog(log: { date: string; photos?: string[] | null }): PhotoItem[] {
  return (log.photos || [])
    .filter(Boolean)
    .map((url) => ({ url: url as string, date: log.date, type: 'individual' as const }))
}

export function photosFromClassNote(note: ClassNotePhotosSource): PhotoItem[] {
  return classNotePhotoUrls(note).map((url) => ({
    url,
    date: note.date,
    type: 'group' as const,
  }))
}
