import { createAdminClient } from '@/lib/supabase/admin'

async function filterActiveGuardianIds(guardianIds: string[]): Promise<string[]> {
  const unique = [...new Set(guardianIds.filter(Boolean))]
  if (!unique.length) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .in('id', unique)
    .eq('status', 'active')

  return (data || []).map((p) => p.id)
}

/** Guardians vinculats a un alumne (perfil actiu). */
export async function getGuardianIdsForStudent(studentId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('student_guardians')
    .select('guardian_id')
    .eq('student_id', studentId)

  return filterActiveGuardianIds((data || []).map((r) => r.guardian_id))
}

/** Guardians amb fills a l'aula. */
export async function getGuardianIdsForClassroom(classroomId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data: students } = await admin
    .from('students')
    .select('id')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')

  if (!students?.length) return []

  const { data: links } = await admin
    .from('student_guardians')
    .select('guardian_id')
    .in(
      'student_id',
      students.map((s) => s.id)
    )

  return filterActiveGuardianIds((links || []).map((r) => r.guardian_id))
}

/** Guardians del centre (menú menjador, avisos globals). */
export async function getGuardianIdsForSchool(schoolId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data: students } = await admin
    .from('students')
    .select('id')
    .eq('school_id', schoolId)
    .eq('status', 'active')

  if (!students?.length) return []

  const { data: links } = await admin
    .from('student_guardians')
    .select('guardian_id')
    .in(
      'student_id',
      students.map((s) => s.id)
    )

  return filterActiveGuardianIds((links || []).map((r) => r.guardian_id))
}
