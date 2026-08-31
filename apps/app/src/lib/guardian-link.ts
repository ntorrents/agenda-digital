import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeEmail, syncAuthAndProfileEmail } from '@/lib/auth-email'

export function normalizeRelation(raw: string): string {
  const v = (raw || '').trim().toLowerCase()
  if (['father', 'pare', 'padre', 'papà', 'papá', 'papa', 'dad'].includes(v)) return 'father'
  if (['mother', 'mare', 'madre', 'mamà', 'mamá', 'mama', 'mum', 'mom'].includes(v)) return 'mother'
  if (['tutor', 'tutora', 'tutor/a'].includes(v)) return 'tutor'
  if (['other', 'altre', 'otro', 'altra'].includes(v)) return 'other'
  return v || 'other'
}

export function normalizeGender(raw: string | null | undefined): string | null {
  if (!raw) return null
  const v = raw.trim().toUpperCase()
  if (['M', 'BOY', 'NEN', 'NIÑO', 'NINO'].includes(v)) return 'boy'
  if (['F', 'GIRL', 'NENA', 'NIÑA', 'NINA'].includes(v)) return 'girl'
  if (['OTHER', 'ALTRE', 'OTRO'].includes(v)) return 'other'
  return null
}

type GuardianInput = {
  id?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  relation?: string | null
}

/** Crea o actualitza tutor i l'enllaça amb l'alumne. */
export async function upsertGuardianForStudent(
  db: SupabaseClient,
  opts: {
    studentId: string
    schoolId: string
    guardian: GuardianInput
  }
) {
  const gName = opts.guardian.name?.trim()
  const gEmail = normalizeEmail(opts.guardian.email || '')
  const gPhone = opts.guardian.phone?.trim() || ''
  const gRel = normalizeRelation(opts.guardian.relation || '')
  const gId = opts.guardian.id

  if (!gName || !gEmail) return

  if (gId) {
    const { data: guardian } = await db
      .from('profiles')
      .select('id, email, school_id')
      .eq('id', gId)
      .single()

    if (!guardian || guardian.school_id !== opts.schoolId) {
      throw new Error('Tutor no vàlid per aquest centre')
    }

    if (normalizeEmail(guardian.email || '') !== gEmail) {
      await syncAuthAndProfileEmail(gId, gEmail)
    }

    const { error: profileError } = await db
      .from('profiles')
      .update({ full_name: gName, phone: gPhone || null })
      .eq('id', gId)
    if (profileError) throw new Error('Error actualitzant el tutor: ' + profileError.message)

    const { error: relError } = await db
      .from('student_guardians')
      .update({ relation: gRel })
      .eq('guardian_id', gId)
      .eq('student_id', opts.studentId)
    if (relError) throw new Error('Error actualitzant el parentiu: ' + relError.message)
    return
  }

  const { data: existingProfile } = await db.from('profiles').select('id').eq('email', gEmail).maybeSingle()
  let guardianId = existingProfile?.id as string | undefined

  if (guardianId) {
    await db.from('profiles').update({ full_name: gName, phone: gPhone || null }).eq('id', guardianId)
  } else {
    const { data: newGuardianId, error: rpcError } = await db.rpc('create_guardian_user', {
      p_email: gEmail,
      p_full_name: gName,
      p_phone: gPhone || null,
      p_school_id: opts.schoolId,
      p_password: 'changeme123',
    })
    if (rpcError || !newGuardianId) {
      throw new Error(`No s'ha pogut crear el tutor ${gEmail}: ${rpcError?.message || 'RPC sense resultat'}`)
    }
    guardianId = newGuardianId as string
  }

  const { data: existingLink } = await db
    .from('student_guardians')
    .select('id')
    .eq('student_id', opts.studentId)
    .eq('guardian_id', guardianId)
    .maybeSingle()

  if (existingLink) {
    await db.from('student_guardians').update({ relation: gRel }).eq('id', existingLink.id)
  } else {
    const { error: insertError } = await db.from('student_guardians').insert({
      student_id: opts.studentId,
      guardian_id: guardianId,
      relation: gRel,
    })
    if (insertError) throw new Error('Error enllaçant el tutor: ' + insertError.message)
  }
}

export async function upsertGuardianFromFormData(
  db: SupabaseClient,
  opts: { studentId: string; schoolId: string; formData: FormData; prefix: string }
) {
  await upsertGuardianForStudent(db, {
    studentId: opts.studentId,
    schoolId: opts.schoolId,
    guardian: {
      id: (opts.formData.get(`${opts.prefix}_id`) as string) || null,
      name: (opts.formData.get(`${opts.prefix}_name`) as string) || null,
      email: (opts.formData.get(`${opts.prefix}_email`) as string) || null,
      phone: (opts.formData.get(`${opts.prefix}_phone`) as string) || null,
      relation: (opts.formData.get(`${opts.prefix}_relation`) as string) || null,
    },
  })
}
