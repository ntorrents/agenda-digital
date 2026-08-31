'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { normalizeEmail, syncAuthAndProfileEmail } from '@/lib/auth-email'
import { sendAccessEmail } from '@/lib/email'

function normalizeRelation(raw: string): string {
  const v = (raw || '').trim().toLowerCase()
  if (['father', 'pare', 'padre', 'papà', 'papá', 'papa', 'dad'].includes(v)) return 'father'
  if (['mother', 'mare', 'madre', 'mamà', 'mamá', 'mama', 'mum', 'mom'].includes(v)) return 'mother'
  if (['tutor', 'tutora', 'tutor/a'].includes(v)) return 'tutor'
  if (['other', 'altre', 'otro', 'altra'].includes(v)) return 'other'
  return v || 'other'
}

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single()
  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    throw new Error('Unauthorized. Staff access required.')
  }
  return { supabase, user, profile }
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized. Admin access required.')
  return { supabase, user }
}

function adminDb() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

async function upsertGuardianLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opts: {
    studentId: string
    schoolId: string
    formData: FormData
    prefix: string
  }
) {
  const db = adminDb() || supabase
  const gId = opts.formData.get(`${opts.prefix}_id`) as string
  const gName = (opts.formData.get(`${opts.prefix}_name`) as string)?.trim()
  const gEmail = normalizeEmail((opts.formData.get(`${opts.prefix}_email`) as string) || '')
  const gPhone = (opts.formData.get(`${opts.prefix}_phone`) as string) || ''
  const gRel = normalizeRelation((opts.formData.get(`${opts.prefix}_relation`) as string) || '')

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

    const { error: profileError } = await db.from('profiles').update({
      full_name: gName,
      phone: gPhone,
    }).eq('id', gId)
    if (profileError) throw new Error('Error actualitzant el tutor: ' + profileError.message)

    const { error: relError } = await db.from('student_guardians').update({ relation: gRel })
      .eq('guardian_id', gId)
      .eq('student_id', opts.studentId)
    if (relError) throw new Error('Error actualitzant el parentiu: ' + relError.message)
    return
  }

  const { data: existingProfile } = await db.from('profiles').select('id').eq('email', gEmail).maybeSingle()
  let guardianId = existingProfile?.id as string | undefined

  if (guardianId) {
    await db.from('profiles').update({ full_name: gName, phone: gPhone }).eq('id', guardianId)
  } else {
    const { data: newGuardianId, error: rpcError } = await db.rpc('create_guardian_user', {
      p_email: gEmail,
      p_full_name: gName,
      p_phone: gPhone,
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

export async function createClassroom(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')

  const name = formData.get('name') as string
  const level = formData.get('level') as string
  const capacity = parseInt(formData.get('capacity') as string || '15', 10)
  const teacherId = formData.get('teacher_id') as string
  const auxIds = formData.getAll('auxiliary_teacher_ids') as string[]

  if (!name || !level) throw new Error('Missing required fields')

  const payload = {
    school_id: profile.school_id,
    name,
    level,
    capacity,
    teacher_id: teacherId === 'none' ? null : teacherId,
    auxiliary_teacher_ids: auxIds.filter(id => id !== 'none'),
    status: 'active'
  }

  const { error } = await supabase
    .from('classrooms')
    .insert([payload])

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/aulas')
  return { success: true }
}

export async function updateClassroom(formData: FormData) {
  const { supabase } = await requireAdmin()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const level = formData.get('level') as string
  const capacity = parseInt(formData.get('capacity') as string, 10)
  const teacherId = formData.get('teacher_id') as string
  const auxIds = formData.getAll('auxiliary_teacher_ids') as string[]

  if (!id || !name || !level) throw new Error('Missing required fields')

  const payload = {
    name,
    level,
    capacity,
    teacher_id: teacherId === 'none' ? null : teacherId,
    auxiliary_teacher_ids: auxIds.filter(id => id !== 'none')
  }

  const { error } = await supabase
    .from('classrooms')
    .update(payload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/aulas')
  return { success: true }
}

export async function deleteClassroom(classroomId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/aulas')
  return { success: true }
}

export async function createStudent(formData: FormData) {
  const { supabase, profile } = await requireStaff()

  const schoolId = profile.school_id
  if (!schoolId) throw new Error('No profile')

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const dob = formData.get('date_of_birth') as string
  const classroomId = formData.get('classroom_id') as string
  const gender = formData.get('gender') as string || null
  const intolerances = formData.get('intolerances') as string || null
  const authorized_pickup = formData.get('authorized_pickup') as string || null
  const parents_phone = formData.get('parents_phone') as string || null
  const internal_notes = formData.get('internal_notes') as string || null

  if (!firstName || !lastName || !dob) throw new Error('Missing required fields')

  const payload = {
    school_id: profile.school_id,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dob,
    classroom_id: classroomId === 'none' ? null : classroomId,
    gender,
    intolerances,
    authorized_pickup,
    internal_notes,
    status: 'active'
  }

  const { data: insertedStudent, error } = await supabase
    .from('students')
    .insert([payload])
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const studentId = insertedStudent.id

  await upsertGuardianLink(supabase, { studentId, schoolId: profile.school_id, formData, prefix: 'guardian_1' })
  await upsertGuardianLink(supabase, { studentId, schoolId: profile.school_id, formData, prefix: 'guardian_2' })

  revalidatePath('/dashboard/config/alumnos')
  revalidatePath(`/dashboard/config/alumnos/${studentId}`)
  return { success: true }
}

export async function updateStudent(formData: FormData) {
  const { supabase } = await requireStaff()

  const id = formData.get('id') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const dob = formData.get('date_of_birth') as string
  const classroomId = formData.get('classroom_id') as string
  const gender = formData.get('gender') as string || null
  const intolerances = formData.get('intolerances') as string || null
  const authorized_pickup = formData.get('authorized_pickup') as string || null
  const internal_notes = formData.get('internal_notes') as string || null

  if (!id || !firstName || !lastName || !dob) throw new Error('Missing required fields')

  const payload = {
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dob,
    classroom_id: classroomId === 'none' ? null : classroomId,
    gender,
    intolerances,
    authorized_pickup,
    internal_notes
  }

  const { error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  const { data: studentData } = await supabase.from('students').select('school_id').eq('id', id).single()
  const school_id = studentData?.school_id
  if (!school_id) throw new Error('Estudiant sense escola')

  await upsertGuardianLink(supabase, { studentId: id, schoolId: school_id, formData, prefix: 'guardian_1' })
  await upsertGuardianLink(supabase, { studentId: id, schoolId: school_id, formData, prefix: 'guardian_2' })

  revalidatePath('/dashboard/config/alumnos')
  revalidatePath(`/dashboard/config/alumnos/${id}`)
  return { success: true }
}

export async function deleteStudent(studentId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/alumnos')
  return { success: true }
}

export async function sendWelcomeEmail(userId: string) {
  const { supabase } = await requireAdmin();

  // 1. Get user details
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', (await supabase.auth.getUser()).data.user!.id)
    .single();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, full_name, role, school_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User not found');
  }
  if (!adminProfile?.school_id || profile.school_id !== adminProfile.school_id) {
    throw new Error('Unauthorized');
  }

  const normalizedEmail = normalizeEmail(profile.email || '')
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();

  let targetUserId = userId
  if (normalizedEmail) {
    const { data: canonical } = await adminClient
      .from('profiles')
      .select('id')
      .eq('school_id', adminProfile.school_id)
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (canonical?.id) targetUserId = canonical.id
  }

  // 2. Generate random password
  const tempPassword = Math.random().toString(36).slice(-8);

  // 3. Update Auth user via Admin API
  const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: tempPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 4. Enviar correu i marcar perfil
  await sendAccessEmail({
    to: profile.email!,
    fullName: profile.full_name || '',
    tempPassword,
    role: profile.role,
  })

  const { error: dbError } = await adminClient
    .from('profiles')
    .update({
      force_password_reset: true,
      welcome_email_sent: true,
    })
    .eq('id', targetUserId)

  if (dbError) {
    throw new Error(dbError.message)
  }

  const { data: linkedStudents } = await adminClient
    .from('student_guardians')
    .select('student_id')
    .eq('guardian_id', targetUserId)

  revalidatePath('/dashboard/config/alumnos')
  for (const row of linkedStudents || []) {
    revalidatePath(`/dashboard/config/alumnos/${row.student_id}`)
  }

  return { success: true, emailSent: true }
}

export async function sendMassWelcomeEmails(role: 'guardian' | 'teacher') {
  const { supabase } = await requireAdmin();
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();

  // Get all users of this role in the school who haven't received the email
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', (await supabase.auth.getUser()).data.user!.id)
    .single();

  if (!profile) throw new Error('No profile');

  const { data: targetUsers, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('school_id', profile.school_id)
    .eq('role', role)
    .eq('welcome_email_sent', false)
    .eq('status', 'active');

  if (fetchError) throw new Error(fetchError.message);
  if (!targetUsers || targetUsers.length === 0) {
    return { success: true, count: 0 };
  }

  let successCount = 0
  const failures: string[] = []

  for (const user of targetUsers) {
    const tempPassword = Math.random().toString(36).slice(-8)

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: tempPassword,
    })

    if (updateError) {
      failures.push(user.email || user.id)
      continue
    }

    try {
      await sendAccessEmail({
        to: user.email!,
        fullName: user.full_name || '',
        tempPassword,
        role,
      })

      const { error: dbError } = await adminClient
        .from('profiles')
        .update({
          force_password_reset: true,
          welcome_email_sent: true,
        })
        .eq('id', user.id)

      if (dbError) {
        failures.push(user.email || user.id)
      } else {
        successCount++
      }
    } catch {
      failures.push(user.email || user.id)
    }
  }

  if (successCount === 0 && failures.length > 0) {
    throw new Error('No s\'han pogut enviar els correus. Comprova la configuració de Resend.')
  }

  return { success: true, count: successCount, failed: failures.length }
}