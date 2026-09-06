import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FamilyProfileForm } from '@/components/family/FamilyProfileForm'
import { PushNotificationsCard } from '@/components/pwa/PushNotificationsCard'
import { User, Baby, School } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'

import { getActiveStudentForGuardian } from '@/lib/guardian-students-server'

const DATE_LOCALES: Record<string, string> = {
  ca: 'ca-ES',
  es: 'es-ES',
  en: 'en-GB',
  fr: 'fr-FR',
}

export default async function FamilyProfilePage(props: {
  searchParams: Promise<{ student?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const t = await getTranslations('familyProfile')
  const locale = await getLocale()
  const dateLocale = DATE_LOCALES[locale] || 'ca-ES'

  const { activeStudentId } = await getActiveStudentForGuardian(
    supabase,
    user.id,
    searchParams.student
  )

  let studentData = null
  let classroomData = null

  if (activeStudentId) {
    const { data: student } = await supabase
      .from('students')
      .select('*, classrooms(*)')
      .eq('id', activeStudentId)
      .single()

    if (student) {
      studentData = student
      classroomData = Array.isArray(student.classrooms)
        ? student.classrooms[0]
        : student.classrooms
    }
  }

  return (
    <main className="max-w-md mx-auto pt-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <User className="h-6 w-6 text-teal-600" /> {t('title')}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t('subtitle')}</p>
      </div>

      {studentData && (
        <div className="bg-amber-50/50 border border-amber-200/50 rounded-[28px] p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
              <Baby className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider">
              {t('childSection')}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/60 p-3 rounded-2xl border border-white">
              <span className="text-xs font-bold text-stone-500">{t('officialName')}</span>
              <span className="text-xs font-black text-stone-800">
                {studentData.first_name} {studentData.last_name}
              </span>
            </div>

            {studentData.date_of_birth && (
              <div className="flex justify-between items-center bg-white/60 p-3 rounded-2xl border border-white">
                <span className="text-xs font-bold text-stone-500">{t('birthDate')}</span>
                <span className="text-xs font-black text-stone-800">
                  {new Date(studentData.date_of_birth).toLocaleDateString(dateLocale)}
                </span>
              </div>
            )}

            {classroomData && (
              <div className="flex justify-between items-center bg-white/60 p-3 rounded-2xl border border-white">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <School className="h-3 w-3" /> {t('classroom')}
                </span>
                <span className="text-xs font-black bg-teal-50 text-teal-800 px-3 py-1 rounded-full border border-teal-100">
                  {classroomData.name} ({classroomData.level})
                </span>
              </div>
            )}

            <p className="text-[10px] text-amber-700/70 font-medium px-2 leading-relaxed mt-2">
              {t('officialNote')}
            </p>
          </div>
        </div>
      )}

      <PushNotificationsCard />

      <FamilyProfileForm profile={profile} email={user.email} student={studentData} />
    </main>
  )
}
