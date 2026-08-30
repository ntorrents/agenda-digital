'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { GalleryByDay } from '@/components/gallery/GalleryByDay'
import { DownloadAllPhotosButton } from '@/components/family/DownloadAllPhotosButton'
import { groupPhotosByDay, type GalleryPhoto } from '@/lib/group-photos-by-day'

type ClassroomOption = { id: string; name: string }
type StudentOption = { id: string; label: string; classroomId: string | null }

export function AdminGalleryView({
  photos,
  classrooms,
  students,
  locale,
}: {
  photos: GalleryPhoto[]
  classrooms: ClassroomOption[]
  students: StudentOption[]
  locale: string
}) {
  const t = useTranslations('dashboardGaleria')
  const [classroomId, setClassroomId] = useState<string>('all')
  const [studentId, setStudentId] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'group'>('all')

  const filteredStudents = useMemo(() => {
    if (classroomId === 'all') return students
    return students.filter((s) => s.classroomId === classroomId)
  }, [students, classroomId])

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (studentId !== 'all') {
        if (p.studentId !== studentId) return false
      } else if (classroomId !== 'all') {
        if (p.classroomId !== classroomId) return false
      }
      return true
    })
  }, [photos, typeFilter, studentId, classroomId])

  const groups = groupPhotosByDay(filtered)
  const downloadItems = filtered.map((photo, index) => ({
    url: photo.url,
    filename: `${photo.date}-${photo.type}-${index + 1}.jpg`,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200/60 rounded-[24px] p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('filterClassroom')}</label>
          <select
            value={classroomId}
            onChange={(e) => {
              setClassroomId(e.target.value)
              setStudentId('all')
            }}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800"
          >
            <option value="all">{t('filterAllClassrooms')}</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('filterStudent')}</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800"
          >
            <option value="all">{t('filterAllStudents')}</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('filterType')}</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'individual' | 'group')}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800"
          >
            <option value="all">{t('filterAllTypes')}</option>
            <option value="individual">{t('typeIndividual')}</option>
            <option value="group">{t('typeGroup')}</option>
          </select>
        </div>
        <div className="ml-auto">
          <DownloadAllPhotosButton photos={downloadItems} label={t('downloadAll')} zipName="galeria-centre.zip" />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white border border-stone-200/60 rounded-[32px] p-12 text-center shadow-xs">
          <p className="text-stone-500">{t('emptyDesc')}</p>
        </div>
      ) : (
        <GalleryByDay groups={groups} locale={locale} photoAltPrefix={t('photoAlt')} />
      )}
    </div>
  )
}
