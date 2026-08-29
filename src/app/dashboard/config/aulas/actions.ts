'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAllClassrooms(classrooms: any[], schoolId: string) {
  const supabase = await createClient()

  // First we upsert the classrooms
  const classroomsToUpsert = classrooms.map(c => {
    // Si no tiene id, es nuevo (el id temporal de UI no se debe mandar a DB)
    const isNew = typeof c.id === 'string' && c.id.startsWith('new-')
    
    return {
      ...(isNew ? {} : { id: c.id }), // Si es nuevo no mandamos ID para que lo genere
      school_id: schoolId,
      name: c.name,
      level: c.level,
      capacity: c.capacity ? parseInt(c.capacity) : null,
      teacher_id: c.teacher_id || null,
      status: 'active'
    }
  })

  // Unfortunately Supabase upsert requires primary keys to match
  // Instead of upserting a mix of new and old, we can do them in 2 operations
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
  revalidatePath('/dashboard/config/alumnos') // Para refrescar asignaciones en filtro
  return { success: true }
}

export async function archiveClassroom(classroomId: string) {
  const supabase = await createClient()

  // 1. Archivar aula
  const { error: archiveError } = await supabase
    .from('classrooms')
    .update({ status: 'inactive' })
    .eq('id', classroomId)

  if (archiveError) {
    return { error: 'Error a l\'arxivar l\'aula.' }
  }

  // 2. Liberar alumnos (poner aula a NULL)
  const { error: studentsError } = await supabase
    .from('students')
    .update({ classroom_id: null })
    .eq('classroom_id', classroomId)

  if (studentsError) {
    console.error('Error desassignant alumnes', studentsError)
  }

  revalidatePath('/dashboard/config/aulas')
  revalidatePath('/dashboard/config/alumnos')
  return { success: true }
}
