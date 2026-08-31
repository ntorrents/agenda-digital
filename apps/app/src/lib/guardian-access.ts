import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeEmail } from '@/lib/auth-email'

/** Estat d'accés per correu (hermanos comparteixen el mateix compte). */
export async function getAccessStatusByEmail(
  supabase: SupabaseClient,
  email: string,
  schoolId: string
): Promise<{ profileId: string | null; welcomeEmailSent: boolean }> {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    return { profileId: null, welcomeEmailSent: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, welcome_email_sent')
    .eq('school_id', schoolId)
    .eq('email', normalized)
    .maybeSingle()

  return {
    profileId: profile?.id ?? null,
    welcomeEmailSent: !!profile?.welcome_email_sent,
  }
}
