import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { DownloadAllPhotosButton } from '@/components/family/DownloadAllPhotosButton'
import { FamilyGalleryView } from '@/components/family/FamilyGalleryView'
import { photosFromClassNote, photosFromDailyLog } from '@/lib/photos'
import { groupPhotosByDay, type GalleryPhoto } from '@/lib/group-photos-by-day'
import { getActiveStudentForGuardian } from '@/lib/guardian-students-server'

export default async function GaleriaPage(props: {
  searchParams: Promise<{ date?: string; student?: string }>
}) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('gallery')
  const locale = await getLocale()

  const { activeStudentId } = await getActiveStudentForGuardian(
    supabase,
    user.id,
    searchParams.student
  )

  if (!activeStudentId) {
    return <div>{t('noStudent')}</div>
  }

  const { data: student } = await supabase
    .from('students')
    .select('classroom_id, first_name')
    .eq('id', activeStudentId)
    .maybeSingle()

  const { data: logsWithPhotos } = await supabase
    .from('daily_logs')
    .select('date, photos')
    .eq('student_id', activeStudentId)
    .eq('status', 'published')
    .not('photos', 'is', null)
    .order('date', { ascending: false })

  let classroomPhotos: GalleryPhoto[] = []
  if (student?.classroom_id) {
    const { data: classNotes } = await supabase
      .from('classroom_daily_notes')
      .select('date, photo_url')
      .eq('classroom_id', student.classroom_id)
      .not('photo_url', 'is', null)
      .order('date', { ascending: false })

    if (classNotes) {
      classroomPhotos = classNotes.flatMap((note) =>
        photosFromClassNote(note).map((photo) => ({
          url: photo.url,
          date: photo.date,
          type: 'group' as const,
          typeLabel: t('group'),
        }))
      )
    }
  }

  const individualPhotos: GalleryPhoto[] = (logsWithPhotos || []).flatMap((log) =>
    photosFromDailyLog(log).map((photo) => ({
      url: photo.url,
      date: photo.date,
      type: 'individual' as const,
      typeLabel: t('individual'),
    }))
  )

  const allPhotos = [...individualPhotos, ...classroomPhotos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const dayPhotos = allPhotos.filter((photo) => photo.date === dateStr)
  const allGroups = groupPhotosByDay(allPhotos)
  const dayGroups = groupPhotosByDay(dayPhotos)

  const downloadItems = allPhotos.map((photo, index) => ({
    url: photo.url,
    filename: `${student?.first_name || 'foto'}-${photo.date}-${index + 1}.jpg`,
  }))

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-emerald-600" /> {t('title')}
          </h2>
          <p className="text-sm text-stone-500 mt-1">{t('subtitle')}</p>
        </div>
        {allPhotos.length > 0 && (
          <DownloadAllPhotosButton
            photos={downloadItems}
            label={t('downloadAll')}
            zipName={`galeria-${student?.first_name || 'familia'}.zip`}
          />
        )}
      </div>

      <FamilyGalleryView
        dayGroups={dayGroups}
        allGroups={allGroups}
        dayEmpty={dayPhotos.length === 0}
        allEmpty={allPhotos.length === 0}
        locale={locale}
        photoAltPrefix={t('photoOf')}
        noPhotosLabel={t('noPhotos')}
        viewDayLabel={t('viewDay')}
        viewAllLabel={t('viewAll')}
      />
    </div>
  )
}
