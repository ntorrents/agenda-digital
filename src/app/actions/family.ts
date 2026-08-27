'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateFamilyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No estás autenticado')
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const oldPassword = formData.get('old_password') as string
  const newPassword = formData.get('new_password') as string
  
  const studentId = formData.get('student_id') as string
  const alias = formData.get('alias') as string

  // Actualizar Perfil de Tutor
  const updates: any = {}
  if (fullName) updates.full_name = fullName
  if (phone) updates.phone = phone

  if (Object.keys(updates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (profileError) {
      throw new Error('Error al actualizar el perfil: ' + profileError.message)
    }
  }

  // Actualizar Contraseña (si se provee antigua y nueva)
  if (oldPassword && newPassword) {
    // Para cambiar la contraseña se requiere login previo si no está forzado, pero Supabase auth
    // proporciona `updateUser` que en Auth v2 requiere estar autenticado
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (passwordError) {
      throw new Error('Error al actualizar la contraseña: ' + passwordError.message)
    }
  }

  // Actualizar Alias del niño
  if (studentId && alias !== null) {
    // Validar que el usuario sea realmente el tutor
    const { data: isGuardian } = await supabase
      .from('student_guardians')
      .select('id')
      .eq('guardian_id', user.id)
      .eq('student_id', studentId)
      .single()
      
    if (isGuardian) {
      const { error: aliasError } = await supabase
        .from('students')
        .update({ alias })
        .eq('id', studentId)

      if (aliasError) {
        throw new Error('Error al actualizar el alias del alumno.')
      }
    }
  }

  revalidatePath('/mi-hijo/perfil')
  revalidatePath('/mi-hijo')
}
