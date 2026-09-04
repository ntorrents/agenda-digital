import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveStudentForGuardian } from '@/lib/guardian-students-server'
import { fetchFamilyAgendaDay } from '@/app/actions/family-agenda'
import { FamilyAgendaClient } from '@/components/family/FamilyAgendaClient'

export default async function FamilyAgendaPage(props: {
  searchParams: Promise<{ date?: string; student?: string }>
}) {
  const searchParams = await props.searchParams
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { activeStudentId } = await getActiveStudentForGuardian(
    supabase,
    user.id,
    searchParams.student
  )
  if (!activeStudentId) redirect('/login')

  const fallbackData = await fetchFamilyAgendaDay(activeStudentId, dateStr)

  return (
    <FamilyAgendaClient
      studentId={activeStudentId}
      dateStr={dateStr}
      fallbackData={fallbackData}
    />
  )
}
