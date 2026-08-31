import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Baby } from 'lucide-react'
import Link from 'next/link'
import { StudentDetailForm } from '@/components/admin/StudentDetailForm'
import { getTranslations } from 'next-intl/server'

import { getAccessStatusByEmail } from '@/lib/guardian-access'

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch the student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('school_id', profile.school_id)
    .single()

  if (!student) {
    redirect('/dashboard/config/alumnos')
  }

  // Fetch all classrooms to populate the assignment dropdown
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, level')
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  // Fetch guardians + profiles (join anidat sovint torna buit per RLS)
  const { data: guardianRows } = await supabase
    .from('student_guardians')
    .select('guardian_id, relation')
    .eq('student_id', resolvedParams.id)

  const guardianIds = (guardianRows || []).map(r => r.guardian_id)
  const { data: guardianProfiles } = guardianIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, email, phone, welcome_email_sent')
        .in('id', guardianIds)
    : { data: [] as any[] }

  const profileById = new Map((guardianProfiles || []).map(p => [p.id, p]))
  const guardians = await Promise.all(
    (guardianRows || []).map(async (row) => {
      const p = profileById.get(row.guardian_id) || null
      if (!p?.email) {
        return {
          guardian_id: row.guardian_id,
          relation: row.relation,
          profiles: p,
        }
      }

      const access = await getAccessStatusByEmail(supabase, p.email, profile.school_id)

      return {
        guardian_id: row.guardian_id,
        relation: row.relation,
        profiles: {
          ...p,
          id: access.profileId || p.id,
          welcome_email_sent: access.welcomeEmailSent,
        },
      }
    })
  )

  const t = await getTranslations('dashboardAlumnos')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config/alumnos"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Baby className="h-5 w-5 text-teal-600" /> {t('titleEdit')}
          </h3>
          <p className="text-xs text-stone-500">{t('descEdit', { name: `${student.first_name} ${student.last_name}` })}</p>
        </div>
      </div>

      <StudentDetailForm classrooms={classrooms || []} initialData={student} guardians={guardians} />
    </div>
  )
}
