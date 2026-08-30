import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Image as ImageIcon } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { photosFromClassNote, photosFromDailyLog } from '@/lib/photos'
import { getTeacherClassroom } from '@/lib/teacher-classroom'
import type { GalleryPhoto } from '@/lib/group-photos-by-day'
import { AdminGalleryView } from '@/components/gallery/AdminGalleryView'
import { StaffGalleryView } from '@/components/gallery/StaffGalleryView'

export default async function DashboardGaleriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) redirect('/login')

  const t = await getTranslations('dashboardGaleria')
  const locale = await getLocale()
  const isAdmin = profile.role === 'admin'

  let classroomFilterId: string | null = null
  if (!isAdmin) {
    const classroom = await getTeacherClassroom(supabase, user.id, profile.role)
    classroomFilterId = classroom?.id ?? null
  }

  let classNotesQuery = supabase
    .from('classroom_daily_notes')
    .select('date, photo_url, classroom_id, classrooms(name)')
    .eq('school_id', profile.school_id)
    .not('photo_url', 'is', null)

  let dailyLogsQuery = supabase
    .from('daily_logs')
    .select('date, photos, student_id, classroom_id, students(first_name, last_name, classroom_id, classrooms(name))')
    .eq('school_id', profile.school_id)
    .not('photos', 'is', null)

  if (classroomFilterId) {
    classNotesQuery = classNotesQuery.eq('classroom_id', classroomFilterId)
    dailyLogsQuery = dailyLogsQuery.eq('classroom_id', classroomFilterId)
  }

  const [{ data: classNotes }, { data: dailyLogs }] = await Promise.all([
    classNotesQuery,
    dailyLogsQuery,
  ])

  const galleryPhotos: GalleryPhoto[] = [
    ...(classNotes || []).flatMap((p: {
      date: string
      photo_url?: string | null
      classroom_id: string
      classrooms?: { name: string } | { name: string }[] | null
    }) => {
      const classroom = Array.isArray(p.classrooms) ? p.classrooms[0] : p.classrooms
      return photosFromClassNote(p).map((photo) => ({
        url: photo.url,
        date: photo.date,
        type: 'group' as const,
        typeLabel: t('typeGroup'),
        context: classroom?.name || t('classroomFallback'),
        classroomId: p.classroom_id,
        studentId: null,
      }))
    }),
    ...(dailyLogs || []).flatMap((log) =>
      photosFromDailyLog(log).map((photo) => {
        const student = Array.isArray(log.students) ? log.students[0] : log.students
        return {
          url: photo.url,
          date: photo.date,
          type: 'individual' as const,
          typeLabel: t('typeIndividual'),
          context: student
            ? `${student.first_name} ${student.last_name?.charAt(0) || ''}.`
            : t('classroomFallback'),
          classroomId: log.classroom_id,
          studentId: log.student_id,
        }
      })
    ),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const { data: classrooms } = isAdmin
    ? await supabase
        .from('classrooms')
        .select('id, name')
        .eq('school_id', profile.school_id)
        .neq('status', 'inactive')
        .order('name')
    : { data: [] }

  const { data: students } = isAdmin
    ? await supabase
        .from('students')
        .select('id, first_name, last_name, classroom_id')
        .eq('school_id', profile.school_id)
        .eq('status', 'active')
        .order('first_name')
    : { data: [] }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
          <ImageIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">{t('title')}</h2>
          <p className="text-stone-500 font-medium text-sm mt-0.5">{t('desc')}</p>
        </div>
      </div>

      {isAdmin ? (
        <AdminGalleryView
          photos={galleryPhotos}
          classrooms={classrooms || []}
          students={(students || []).map((s) => ({
            id: s.id,
            label: `${s.first_name} ${s.last_name}`,
            classroomId: s.classroom_id,
          }))}
          locale={locale}
        />
      ) : (
        <StaffGalleryView photos={galleryPhotos} locale={locale} zipName="galeria-aula.zip" />
      )}
    </div>
  )
}
