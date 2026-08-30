'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStaffProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No estàs autenticat')
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string)?.trim()
  const oldPassword = formData.get('old_password') as string
  const newPassword = formData.get('new_password') as string

  const profileUpdates: Record<string, string> = {}
  if (fullName) profileUpdates.full_name = fullName
  if (phone !== null && phone !== undefined) profileUpdates.phone = phone

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    if (profileError) {
      throw new Error('Error en actualitzar el perfil: ' + profileError.message)
    }

    await supabase.auth.updateUser({
      data: { full_name: fullName || user.user_metadata?.full_name },
    })
  }

  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email })
    if (emailError) {
      throw new Error('Error en canviar el correu: ' + emailError.message)
    }

    await supabase.from('profiles').update({ email }).eq('id', user.id)
  }

  if (newPassword) {
    if (!oldPassword) {
      throw new Error('Per canviar la contrasenya has d\'introduir l\'actual.')
    }

    if (newPassword.length < 6) {
      throw new Error('La nova contrasenya ha de tenir almenys 6 caràcters.')
    }

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
      throw new Error('Error en canviar la contrasenya: ' + passwordError.message)
    }
  }

  revalidatePath('/dashboard/config/parametres')
  revalidatePath('/dashboard')
}
