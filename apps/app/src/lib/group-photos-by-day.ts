export type GalleryPhoto = {
  url: string
  date: string
  type: 'individual' | 'group'
  typeLabel: string
  context?: string
  classroomId?: string | null
  studentId?: string | null
}

export function groupPhotosByDay(photos: GalleryPhoto[]): { date: string; photos: GalleryPhoto[] }[] {
  const map = new Map<string, GalleryPhoto[]>()
  for (const photo of photos) {
    const list = map.get(photo.date) || []
    list.push(photo)
    map.set(photo.date, list)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, dayPhotos]) => ({ date, photos: dayPhotos }))
}

export function formatGalleryDayHeader(dateStr: string, locale: string): string {
  const localeMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US',
  }
  const loc = localeMap[locale] || 'ca-ES'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
