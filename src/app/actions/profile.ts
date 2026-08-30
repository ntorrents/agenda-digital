'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DASHBOARD_STAFF_ROLES } from '@/lib/roles'
import { normalizeEmail, syncAuthAndProfileEmail } from '@/lib/auth-email'

export async function updateStaffProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No estàs autenticat')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || !(DASHBOARD_STAFF_ROLES as readonly string[]).includes(profile.role)) {
    throw new Error('No autoritzat')
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = formData.get('phone') as string
  const email = normalizeEmail((formData.get('email') as string) || '')
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

  if (email && email !== normalizeEmail(user.email || profile.email || '')) {
    await syncAuthAndProfileEmail(user.id, email)
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
  revalidatePath('/dashboard/config/centro')
  revalidatePath('/dashboard')
}
