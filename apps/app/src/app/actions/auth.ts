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

  // Retornar el rol per redirigir
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { success: true, role: profile?.role || user.app_metadata?.role }
}

export async function resetRecoveryPassword(formData: FormData) {
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

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) throw new Error(updateError.message)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ force_password_reset: false })
    .eq('id', user.id)

  if (profileError) throw new Error(profileError.message)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profile?.status && profile.status !== 'active') {
    await supabase.auth.signOut()
    throw new Error('El teu compte està inactiu. Contacta amb direcció.')
  }

  return { success: true, role: profile?.role || user.app_metadata?.role }
}
