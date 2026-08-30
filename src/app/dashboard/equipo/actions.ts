'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAllStaff(staffMembers: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Buscamos nuevos y existentes
  const existing = staffMembers.filter(s => !s._isNew)
  const newStaff = staffMembers.filter(s => s._isNew)

  let finalError = null

    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient()

    for (const s of existing) {
      // Get the existing profile to check if email changed
      const { data: currentProfile } = await supabase.from('profiles').select('email').eq('id', s.id).single()
      
      if (currentProfile && currentProfile.email !== s.email) {
        // Email has changed, update in Auth
        const { error: authError } = await adminClient.auth.admin.updateUserById(s.id, {
          email: s.email,
          email_confirm: true // Force confirmation so they don't get locked out waiting for a link
        })
        if (authError) {
          console.error('Error updating email in Auth:', authError)
          finalError = authError
          continue // Skip updating profile if auth update fails
        }
      }

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: s.id,
        school_id: s.school_id,
        full_name: s.full_name,
        role: s.role,
        email: s.email, // Now we can update email
        phone: s.phone || null,
        status: s.status || 'active'
      })
      if (upsertError) finalError = upsertError
    }

  // Para los nuevos, tenemos que llamar a create_staff_user para crear su Auth User y perfil
  if (newStaff.length > 0) {
    for (const s of newStaff) {
      const { error } = await supabase.rpc('create_staff_user', {
        p_email: s.email,
        p_full_name: s.full_name,
        p_role: s.role,
        p_password: 'agenda-digital-pwd' // Contraseña temporal
      })
      if (error) {
        finalError = error
        console.error('Error creating new staff:', error)
      }
    }
  }

  if (finalError) {
    return { error: 'Error al guardar l\'equip.' }
  }

  revalidatePath('/dashboard/config/equipo')
  revalidatePath('/dashboard/equipo')
  return { success: true }
}

export async function archiveStaffMember(staffId: string) {
  const supabase = await createClient()

  // 1. Archivar el perfil
  const { error: archiveError } = await supabase
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', staffId)

  if (archiveError) {
    return { error: 'Error a l\'arxivar el perfil.' }
  }

  // 2. Liberar de las aulas
  const { error: classroomsError } = await supabase
    .from('classrooms')
    .update({ teacher_id: null })
    .eq('teacher_id', staffId)

  if (classroomsError) {
    console.error('Error desassignant aules', classroomsError)
  }

  revalidatePath('/dashboard/config/equipo')
  revalidatePath('/dashboard/config/aulas')
  revalidatePath('/dashboard/equipo')
  return { success: true }
}
