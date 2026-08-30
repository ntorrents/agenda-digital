'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { normalizeEmail, syncAuthAndProfileEmail } from '@/lib/auth-email'

const VALID_STATUSES = ['active', 'paused', 'inactive'] as const

function normalizeStaffStatus(status: unknown): (typeof VALID_STATUSES)[number] {
  if (typeof status === 'string' && (VALID_STATUSES as readonly string[]).includes(status)) {
    return status as (typeof VALID_STATUSES)[number]
  }
  return 'active'
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.school_id) {
    return { error: 'Unauthorized' as const }
  }

  return { supabase, user, profile }
}

export async function saveAllStaff(staffMembers: any[]) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return { error: auth.error }

  const { supabase, profile } = auth
  const admin = createAdminClient()
  const existing = staffMembers.filter(s => !s._isNew)
  const newStaff = staffMembers.filter(s => s._isNew)

  let finalError: unknown = null

  for (const s of existing) {
    if (s.school_id && s.school_id !== profile.school_id) {
      finalError = new Error('Unauthorized school')
      continue
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('email, school_id')
      .eq('id', s.id)
      .eq('school_id', profile.school_id)
      .single()

    if (!currentProfile) {
      finalError = new Error('Staff not found')
      continue
    }

    const nextEmail = normalizeEmail(s.email || '')
    if (currentProfile.email && nextEmail && normalizeEmail(currentProfile.email) !== nextEmail) {
      try {
        await syncAuthAndProfileEmail(s.id, nextEmail)
      } catch (authError) {
        console.error('Error updating email in Auth:', authError)
        finalError = authError
        continue
      }
    }

    const { data: updatedRows, error: updateError } = await admin
      .from('profiles')
      .update({
        full_name: s.full_name,
        role: s.role,
        email: nextEmail || currentProfile.email,
        phone: s.phone || null,
        status: normalizeStaffStatus(s.status),
      })
      .eq('id', s.id)
      .eq('school_id', profile.school_id)
      .select('id')

    if (updateError) {
      finalError = updateError
    } else if (!updatedRows?.length) {
      finalError = new Error('No s\'ha pogut actualitzar el perfil')
    }
  }

  if (newStaff.length > 0) {
    for (const s of newStaff) {
      const { error } = await supabase.rpc('create_staff_user', {
        p_email: normalizeEmail(s.email || ''),
        p_full_name: s.full_name,
        p_role: s.role,
        p_password: 'agenda-digital-pwd',
      })
      if (error) {
        finalError = error
        console.error('Error creating new staff:', error)
      }
    }
  }

  if (finalError) {
    const message = finalError instanceof Error ? finalError.message : 'Error al guardar l\'equip.'
    return { error: message }
  }

  revalidatePath('/dashboard/equipo')
  return { success: true }
}

export async function archiveStaffMember(staffId: string) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return { error: auth.error }

  const { supabase, profile } = auth
  const admin = createAdminClient()

  const { error: archiveError } = await admin
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', staffId)
    .eq('school_id', profile.school_id)

  if (archiveError) {
    return { error: 'Error a l\'arxivar el perfil.' }
  }

  const { error: classroomsError } = await supabase
    .from('classrooms')
    .update({ teacher_id: null })
    .eq('teacher_id', staffId)

  if (classroomsError) {
    console.error('Error desassignant aules', classroomsError)
  }

  revalidatePath('/dashboard/config/aulas')
  revalidatePath('/dashboard/equipo')
  return { success: true }
}
