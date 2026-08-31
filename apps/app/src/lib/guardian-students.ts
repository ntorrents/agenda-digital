import type { SupabaseClient } from '@supabase/supabase-js'

export const ACTIVE_STUDENT_COOKIE = 'pd_active_student'

export type GuardianStudent = {
  id: string
  first_name: string
  alias: string | null
  classroom_id: string | null
  classroom_name: string | null
  classroom_level: string | null
  is_primary: boolean
}

export function resolveActiveStudentId(
  students: GuardianStudent[],
  preferredId?: string | null
): string | null {
  if (students.length === 0) return null
  if (preferredId && students.some((s) => s.id === preferredId)) {
    return preferredId
  }
  const primary = students.find((s) => s.is_primary)
  return primary?.id ?? students[0].id
}

export async function getGuardianStudents(
  supabase: SupabaseClient,
  guardianId: string
): Promise<GuardianStudent[]> {
  const { data: links } = await supabase
    .from('student_guardians')
    .select(
      `
      student_id,
      is_primary,
      students (
        id,
        first_name,
        alias,
        classroom_id,
        classrooms ( name, level )
      )
    `
    )
    .eq('guardian_id', guardianId)
    .order('is_primary', { ascending: false })

  if (!links?.length) return []

  return links
    .map((link) => {
      const raw = link.students
      const student = Array.isArray(raw) ? raw[0] : raw
      if (!student) return null

      const classroom = Array.isArray(student.classrooms)
        ? student.classrooms[0]
        : student.classrooms

      return {
        id: student.id as string,
        first_name: student.first_name as string,
        alias: (student.alias as string | null) ?? null,
        classroom_id: (student.classroom_id as string | null) ?? null,
        classroom_name: (classroom?.name as string | null) ?? null,
        classroom_level: (classroom?.level as string | null) ?? null,
        is_primary: !!link.is_primary,
      } satisfies GuardianStudent
    })
    .filter((s): s is GuardianStudent => s !== null)
}

export function classroomLabel(student: GuardianStudent): string {
  if (!student.classroom_name) return ''
  return student.classroom_level
    ? `${student.classroom_name} (${student.classroom_level})`
    : student.classroom_name
}

export function displayStudentName(student: GuardianStudent): string {
  return student.alias?.trim() || student.first_name
}
