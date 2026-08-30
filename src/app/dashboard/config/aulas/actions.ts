'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.school_id) {
    return { error: 'Unauthorized' as const }
  }

  return { supabase, profile }
}

export async function saveAllClassrooms(classrooms: any[], schoolId: string) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return { error: auth.error }

  const { supabase, profile } = auth
  if (schoolId !== profile.school_id) {
    return { error: 'Unauthorized' }
  }

  const classroomsToUpsert = classrooms.map(c => {
    const isNew = typeof c.id === 'string' && c.id.startsWith('new-')

    return {
      ...(isNew ? {} : { id: c.id }),
      school_id: profile.school_id,
      name: c.name,
      level: c.level,
      capacity: c.capacity ? parseInt(c.capacity) : null,
      teacher_id: c.teacher_id || null,
      auxiliary_teacher_ids: c.auxiliary_teacher_ids || [],
      status: 'active'
    }
  })

  const existing = classroomsToUpsert.filter(c => c.id)
  const newClasses = classroomsToUpsert.filter(c => !c.id)

  let error = null

  if (existing.length > 0) {
    const { error: upsertError } = await supabase.from('classrooms').upsert(existing)
    if (upsertError) error = upsertError
  }

  if (newClasses.length > 0) {
    const { error: insertError } = await supabase.from('classrooms').insert(newClasses)
    if (insertError) error = insertError
  }

  if (error) {
    console.error('Error saving classrooms', error)
    return { error: 'Error al guardar les aules.' }
  }

  revalidatePath('/dashboard/config/aulas')
  revalidatePath('/dashboard/config/alumnos')
  return { success: true }
}

export async function archiveClassroom(classroomId: string) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return { error: auth.error }

  const { supabase, profile } = auth

  const { error: archiveError } = await supabase
    .from('classrooms')
    .update({ status: 'inactive' })
    .eq('id', classroomId)
    .eq('school_id', profile.school_id)

  if (archiveError) {
    return { error: 'Error a l\'arxivar l\'aula.' }
  }

  const { error: studentsError } = await supabase
    .from('students')
    .update({ classroom_id: null })
    .eq('classroom_id', classroomId)
    .eq('school_id', profile.school_id)

  if (studentsError) {
    console.error('Error desassignant alumnes', studentsError)
  }

  revalidatePath('/dashboard/config/aulas')
  revalidatePath('/dashboard/config/alumnos')
  return { success: true }
}
