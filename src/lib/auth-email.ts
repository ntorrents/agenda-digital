import { createAdminClient } from '@/lib/supabase/admin'

export function normalizeEmail(email: string) {
  return (email || '').trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Actualitza el correu a Auth (login) i a profiles perquè no es desincronitzin.
 * Confirma el correu de seguida perquè l'usuari pugui entrar amb el nou sense esperar un enllaç.
 */
export async function syncAuthAndProfileEmail(userId: string, rawEmail: string) {
  const email = normalizeEmail(rawEmail)
  if (!isValidEmail(email)) {
    throw new Error('Correu electrònic no vàlid')
  }

  const admin = createAdminClient()

  const { data: taken } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .neq('id', userId)
    .maybeSingle()

  if (taken) {
    throw new Error('Aquest correu ja està en ús')
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
  })

  if (authError) {
    throw new Error("No s'ha pogut actualitzar el correu d'accés: " + authError.message)
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ email })
    .eq('id', userId)

  if (profileError) {
    throw new Error("El login s'ha actualitzat però el perfil ha fallat: " + profileError.message)
  }

  return email
}
