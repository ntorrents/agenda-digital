'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { normalizeEmail, syncAuthAndProfileEmail } from '@/lib/auth-email'

export async function updateFamilyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No estás autenticado')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'guardian') {
    throw new Error('No autoritzat')
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const email = normalizeEmail((formData.get('email') as string) || '')
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

  if (email && email !== normalizeEmail(user.email || profile.email || '')) {
    await syncAuthAndProfileEmail(user.id, email)
  }

  // Actualizar Contraseña (si se provee antigua y nueva)
  if (oldPassword && newPassword) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: oldPassword,
    })

    if (signInError) {
      throw new Error('La contrasenya actual no és correcta.')
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
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
