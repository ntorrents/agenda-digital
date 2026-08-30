import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

export type ClassroomRow = {
  id: string
  school_id: string
  teacher_id: string | null
  auxiliary_teacher_ids: string[] | null
  name?: string
}

export async function getTeacherClassroom(
  supabase: Supabase,
  userId: string,
  role: string,
  classroomId?: string
): Promise<ClassroomRow | null> {
  if (classroomId) {
    const { data } = await supabase
      .from('classrooms')
      .select('id, school_id, teacher_id, auxiliary_teacher_ids, name')
      .eq('id', classroomId)
      .maybeSingle()
    if (!data) return null
    if (role === 'admin') return data
    if (data.teacher_id === userId) return data
    if (data.auxiliary_teacher_ids?.includes(userId)) return data
    return null
  }

  const { data: asMain } = await supabase
    .from('classrooms')
    .select('id, school_id, teacher_id, auxiliary_teacher_ids, name')
    .eq('teacher_id', userId)
    .maybeSingle()

  if (asMain) return asMain

  const { data: asAuxList } = await supabase
    .from('classrooms')
    .select('id, school_id, teacher_id, auxiliary_teacher_ids, name')
    .contains('auxiliary_teacher_ids', [userId])
    .limit(1)

  return asAuxList?.[0] ?? null
}

export async function assertAgendaClassroomAccess(
  supabase: Supabase,
  userId: string,
  role: string,
  classroomId: string
): Promise<ClassroomRow> {
  if (role === 'admin') {
    const classroom = await getTeacherClassroom(supabase, userId, role, classroomId)
    if (!classroom) throw new Error('No autoritzat per aquesta aula')
    return classroom
  }

  if (role === 'teacher' || role === 'auxiliary') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', userId)
      .single()

    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id, school_id, teacher_id, auxiliary_teacher_ids, name')
      .eq('id', classroomId)
      .maybeSingle()

    if (!profile?.school_id || !classroom || classroom.school_id !== profile.school_id) {
      throw new Error('No autoritzat per aquesta aula')
    }

    return classroom
  }

  throw new Error('No autoritzat per aquesta aula')
}

export async function getSchoolClassroom(
  supabase: Supabase,
  userId: string,
  role: string,
  classroomId: string
): Promise<ClassroomRow | null> {
  if (role === 'admin') {
    return getTeacherClassroom(supabase, userId, role, classroomId)
  }

  if (role === 'teacher' || role === 'auxiliary') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', userId)
      .single()

    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id, school_id, teacher_id, auxiliary_teacher_ids, name')
      .eq('id', classroomId)
      .maybeSingle()

    if (!profile?.school_id || !classroom || classroom.school_id !== profile.school_id) {
      return null
    }

    return classroom
  }

  return null
}

export async function assertClassroomAccess(
  supabase: Supabase,
  userId: string,
  role: string,
  classroomId: string
): Promise<ClassroomRow> {
  const classroom = await getTeacherClassroom(supabase, userId, role, classroomId)
  if (!classroom) throw new Error('No autoritzat per aquesta aula')
  return classroom
}
