import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ACTIVE_STUDENT_COOKIE,
  getGuardianStudents,
  resolveActiveStudentId,
  type GuardianStudent,
} from '@/lib/guardian-students'

export async function getActiveStudentForGuardian(
  supabase: SupabaseClient,
  guardianId: string,
  preferredStudentId?: string | null
): Promise<{
  students: GuardianStudent[]
  activeStudentId: string | null
  activeStudent: GuardianStudent | null
}> {
  const students = await getGuardianStudents(supabase, guardianId)
  const cookieStore = await cookies()
  const cookieStudentId = cookieStore.get(ACTIVE_STUDENT_COOKIE)?.value ?? null

  const activeStudentId = resolveActiveStudentId(
    students,
    preferredStudentId ?? cookieStudentId
  )
  const activeStudent =
    students.find((s) => s.id === activeStudentId) ?? students[0] ?? null

  return {
    students,
    activeStudentId: activeStudent?.id ?? null,
    activeStudent,
  }
}
