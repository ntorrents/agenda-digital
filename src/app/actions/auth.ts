'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetForcedPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password.length < 6) {
    throw new Error('La contrasenya ha de tenir almenys 6 caràcters')
  }

  if (password !== confirmPassword) {
    throw new Error('Les contrasenyes no coincideixen')
  }

  // Actualizar auth.users
  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  })

  if (updateError) throw new Error(updateError.message)

  // Marcar profile como reset done
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ force_password_reset: false })
    .eq('id', user.id)

  if (profileError) throw new Error(profileError.message)

  // Retornar el rol para redirigir
  return { success: true, role: user.app_metadata?.role }
}
