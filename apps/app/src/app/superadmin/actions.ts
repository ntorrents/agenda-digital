'use server'

import { revalidatePath } from 'next/cache'
import { normalizeEmail } from '@/lib/auth-email'
import { logAudit } from '@/lib/audit-log'
import { sendAccessEmail } from '@/lib/email'
import { normalizeGender, upsertGuardianFromFormData } from '@/lib/guardian-link'
import { requireSuperadmin } from '@/lib/superadmin-auth'
import { logBillingPriceChange } from '@/app/superadmin/erp-actions'
import { DEFAULT_STAFF_PASSWORD, slugifySchoolName } from '@/lib/superadmin-constants'

function revalidateSuperadmin(schoolId?: string) {
  revalidatePath('/superadmin')
  revalidatePath('/superadmin/escoles')
  revalidatePath('/superadmin/logs')
  if (schoolId) revalidatePath(`/superadmin/escoles/${schoolId}`)
}

export async function sendStaffAccessEmail(schoolId: string, userId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('email, full_name, role, school_id')
    .eq('id', userId)
    .single()

  if (profileError || !profile) return { error: 'Usuari no trobat' }
  if (profile.school_id !== schoolId) return { error: 'Aquest usuari no pertany a aquest centre' }
  if (!profile.email) return { error: 'El perfil no té correu' }

  const tempPassword = Math.random().toString(36).slice(-8)

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  })
  if (updateError) return { error: updateError.message }

  try {
    await sendAccessEmail({
      to: profile.email,
      fullName: profile.full_name || '',
      tempPassword,
      role: profile.role,
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error enviant el correu' }
  }

  const { error: dbError } = await admin
    .from('profiles')
    .update({ force_password_reset: true, welcome_email_sent: true })
    .eq('id', userId)

  if (dbError) return { error: dbError.message }

  await logAudit({
    actorId,
    action: 'staff.send_access',
    entityType: 'profile',
    entityId: userId,
    schoolId,
    payload: { email: profile.email },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function createSchool(formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'El nom és obligatori' }

  const slug = slugifySchoolName((formData.get('slug') as string)?.trim() || name)
  const address = (formData.get('address') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const email = normalizeEmail((formData.get('email') as string) || '') || null
  const cif = (formData.get('cif') as string)?.trim() || null
  const contactEmail = normalizeEmail((formData.get('contact_email') as string) || '') || null

  const { data, error } = await admin
    .from('schools')
    .insert({
      name,
      slug,
      address,
      phone,
      email,
      cif,
      contact_email: contactEmail,
      settings: { ops: { active: true } },
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'school.create',
    entityType: 'school',
    entityId: data.id,
    schoolId: data.id,
    payload: { name, slug },
  })

  revalidateSuperadmin(data.id)
  return { success: true, schoolId: data.id }
}

export async function updateSchoolIdentity(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'El nom és obligatori' }

  const slug = slugifySchoolName((formData.get('slug') as string)?.trim() || name)
  const address = (formData.get('address') as string)?.trim() || null
  const phone = (formData.get('phone') as string)?.trim() || null
  const email = normalizeEmail((formData.get('email') as string) || '') || null
  const cif = (formData.get('cif') as string)?.trim() || null
  const contactEmail = normalizeEmail((formData.get('contact_email') as string) || '') || null

  const { data: current } = await admin.from('schools').select('settings').eq('id', schoolId).single()
  const settings =
    typeof current?.settings === 'object' && current.settings ? { ...current.settings } : {}

  const { error } = await admin
    .from('schools')
    .update({
      name,
      slug,
      address,
      phone,
      email,
      cif,
      contact_email: contactEmail,
      settings,
    })
    .eq('id', schoolId)

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'school.update',
    entityType: 'school',
    entityId: schoolId,
    schoolId,
    payload: { section: 'identity', name, slug },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function updateSchoolBilling(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const billingNotes = (formData.get('billing_notes') as string)?.trim() || ''
  const monthlyPrice = parseFloat((formData.get('monthly_price') as string) || '0') || 0
  const active = formData.get('active') === 'on'

  const { data: current } = await admin.from('schools').select('settings').eq('id', schoolId).single()
  const prev =
    typeof current?.settings === 'object' && current.settings ? (current.settings as Record<string, unknown>) : {}

  const prevBilling = (prev.billing as { monthly_price?: number } | undefined)?.monthly_price

  const settings = {
    ...prev,
    billing: { notes: billingNotes, monthly_price: monthlyPrice },
    ops: { active },
  }

  const { error } = await admin.from('schools').update({ settings }).eq('id', schoolId)

  if (error) return { error: error.message }

  if (prevBilling !== monthlyPrice) {
    await logBillingPriceChange(admin, schoolId, monthlyPrice, actorId)
  }

  await logAudit({
    actorId,
    action: 'school.update',
    entityType: 'school',
    entityId: schoolId,
    schoolId,
    payload: { section: 'billing', monthlyPrice, active },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

/** @deprecated Usa updateSchoolIdentity + updateSchoolBilling */
export async function updateSchool(schoolId: string, formData: FormData) {
  const identity = await updateSchoolIdentity(schoolId, formData)
  if (identity.error) return identity
  return updateSchoolBilling(schoolId, formData)
}

export async function deleteSchool(schoolId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const [{ count: students }, { count: staff }] = await Promise.all([
    admin.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .neq('role', 'superadmin'),
  ])

  if ((students || 0) > 0 || (staff || 0) > 0) {
    return { error: 'No es pot eliminar: encara té alumnes o personal. Desactiva-la en lloc d\'eliminar.' }
  }

  const { error } = await admin.from('schools').delete().eq('id', schoolId)
  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'school.delete',
    entityType: 'school',
    entityId: schoolId,
    schoolId,
  })

  revalidateSuperadmin()
  return { success: true }
}

export async function createClassroom(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const name = (formData.get('name') as string)?.trim()
  const level = (formData.get('level') as string)?.trim() || 'I0'
  const capacity = parseInt((formData.get('capacity') as string) || '15', 10)
  const teacherId = (formData.get('teacher_id') as string) || null

  if (!name) return { error: 'Nom d\'aula obligatori' }

  const { error } = await admin.from('classrooms').insert({
    school_id: schoolId,
    name,
    level,
    capacity,
    teacher_id: teacherId || null,
    auxiliary_teacher_ids: [],
    status: 'active',
  })

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'classroom.create',
    entityType: 'classroom',
    schoolId,
    payload: { name, level },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function updateClassroom(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const level = (formData.get('level') as string)?.trim()
  const capacity = parseInt((formData.get('capacity') as string) || '15', 10)
  const teacherId = (formData.get('teacher_id') as string) || null
  const status = (formData.get('status') as string) || 'active'

  if (!id || !name) return { error: 'Dades incompletes' }

  const { error } = await admin
    .from('classrooms')
    .update({
      name,
      level,
      capacity,
      teacher_id: teacherId || null,
      status,
    })
    .eq('id', id)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'classroom.update',
    entityType: 'classroom',
    entityId: id,
    schoolId,
    payload: { name, status },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function deleteClassroom(schoolId: string, classroomId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { count } = await admin
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('classroom_id', classroomId)
    .eq('status', 'active')

  if ((count || 0) > 0) {
    return { error: 'Aquesta aula té alumnes actius. Reassigna\'ls abans d\'eliminar.' }
  }

  const { error } = await admin.from('classrooms').delete().eq('id', classroomId).eq('school_id', schoolId)
  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'classroom.delete',
    entityType: 'classroom',
    entityId: classroomId,
    schoolId,
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function createStaffMember(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const fullName = (formData.get('full_name') as string)?.trim()
  const email = normalizeEmail((formData.get('email') as string) || '')
  const role = (formData.get('role') as string) || 'teacher'
  const phone = (formData.get('phone') as string)?.trim() || null
  const sendAccess = formData.get('send_access') === 'on'

  if (!fullName || !email) return { error: 'Nom i correu obligatoris' }
  if (!['admin', 'teacher', 'auxiliary'].includes(role)) return { error: 'Rol no vàlid' }

  const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
  if (existing) return { error: 'Aquest correu ja existeix al sistema' }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_STAFF_PASSWORD,
    email_confirm: true,
    app_metadata: { role, school_id: schoolId },
    user_metadata: { full_name: fullName },
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'No s\'ha pogut crear l\'usuari' }
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    school_id: schoolId,
    role,
    full_name: fullName,
    email,
    phone,
    status: 'active',
    force_password_reset: true,
    welcome_email_sent: false,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  await logAudit({
    actorId,
    action: 'staff.create',
    entityType: 'profile',
    entityId: authData.user.id,
    schoolId,
    payload: { email, role, fullName },
  })

  if (sendAccess) {
    const sent = await sendStaffAccessEmail(schoolId, authData.user.id)
    if (sent.error) {
      revalidateSuperadmin(schoolId)
      return {
        success: true,
        userId: authData.user.id,
        tempPassword: DEFAULT_STAFF_PASSWORD,
        error: `Usuari creat però el correu no s'ha enviat: ${sent.error}`,
      }
    }
    revalidateSuperadmin(schoolId)
    return { success: true, userId: authData.user.id, emailSent: true }
  }

  revalidateSuperadmin(schoolId)
  return { success: true, userId: authData.user.id, tempPassword: DEFAULT_STAFF_PASSWORD }
}

export async function updateStaffMember(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const id = formData.get('id') as string
  const fullName = (formData.get('full_name') as string)?.trim()
  const role = (formData.get('role') as string) || 'teacher'
  const phone = (formData.get('phone') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'active'

  if (!id || !fullName) return { error: 'Dades incompletes' }

  const { error } = await admin
    .from('profiles')
    .update({ full_name: fullName, role, phone, status })
    .eq('id', id)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await admin.auth.admin.updateUserById(id, {
    app_metadata: { role, school_id: schoolId },
  })

  await logAudit({
    actorId,
    action: 'staff.update',
    entityType: 'profile',
    entityId: id,
    schoolId,
    payload: { role, status },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function archiveStaffMember(schoolId: string, staffId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { error } = await admin
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', staffId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await admin.from('classrooms').update({ teacher_id: null }).eq('teacher_id', staffId)

  await logAudit({
    actorId,
    action: 'staff.archive',
    entityType: 'profile',
    entityId: staffId,
    schoolId,
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function createStudent(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const dateOfBirth = (formData.get('date_of_birth') as string)?.trim()
  const classroomId = (formData.get('classroom_id') as string) || null
  const gender = normalizeGender((formData.get('gender') as string) || null)

  if (!firstName || !lastName || !dateOfBirth) {
    return { error: 'Nom, cognoms i data de naixement són obligatoris' }
  }

  const { data: inserted, error } = await admin
    .from('students')
    .insert({
      school_id: schoolId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      classroom_id: classroomId || null,
      gender,
      status: 'active',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  try {
    await upsertGuardianFromFormData(admin, {
      studentId: inserted.id,
      schoolId,
      formData,
      prefix: 'guardian_1',
    })
    await upsertGuardianFromFormData(admin, {
      studentId: inserted.id,
      schoolId,
      formData,
      prefix: 'guardian_2',
    })
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : 'Error creant tutors',
    }
  }

  await logAudit({
    actorId,
    action: 'student.create',
    entityType: 'student',
    entityId: inserted.id,
    schoolId,
    payload: { firstName, lastName },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function updateStudent(schoolId: string, formData: FormData) {
  const { admin, actorId } = await requireSuperadmin()

  const id = formData.get('id') as string
  const firstName = (formData.get('first_name') as string)?.trim()
  const lastName = (formData.get('last_name') as string)?.trim()
  const dateOfBirth = (formData.get('date_of_birth') as string)?.trim()
  const classroomId = (formData.get('classroom_id') as string) || null
  const status = (formData.get('status') as string) || 'active'
  const gender = normalizeGender((formData.get('gender') as string) || null)

  if (!id || !firstName || !lastName || !dateOfBirth) {
    return { error: 'Dades incompletes' }
  }

  const { error } = await admin
    .from('students')
    .update({
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      classroom_id: classroomId || null,
      gender,
      status,
    })
    .eq('id', id)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  try {
    await upsertGuardianFromFormData(admin, { studentId: id, schoolId, formData, prefix: 'guardian_1' })
    await upsertGuardianFromFormData(admin, { studentId: id, schoolId, formData, prefix: 'guardian_2' })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error actualitzant tutors' }
  }

  await logAudit({
    actorId,
    action: 'student.update',
    entityType: 'student',
    entityId: id,
    schoolId,
    payload: { status },
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}

export async function archiveStudent(schoolId: string, studentId: string) {
  const { admin, actorId } = await requireSuperadmin()

  const { error } = await admin
    .from('students')
    .update({ status: 'inactive', classroom_id: null })
    .eq('id', studentId)
    .eq('school_id', schoolId)

  if (error) return { error: error.message }

  await logAudit({
    actorId,
    action: 'student.archive',
    entityType: 'student',
    entityId: studentId,
    schoolId,
  })

  revalidateSuperadmin(schoolId)
  return { success: true }
}
