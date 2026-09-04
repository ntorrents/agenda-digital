'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { normalizeEmail } from '@/lib/auth-email'
import { sendAccessEmail } from '@/lib/email'
import { upsertGuardianFromFormData } from '@/lib/guardian-link'

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
  await upsertGuardianFromFormData(db, opts)
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

export async function sendWelcomeEmail(userId: string): Promise<{
  success?: boolean
  emailSent?: boolean
  error?: string
}> {
  try {
    const { supabase, user } = await requireAdmin()

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name, role, school_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { error: 'Usuari no trobat' }
    }
    if (!adminProfile?.school_id || profile.school_id !== adminProfile.school_id) {
      return { error: 'No tens permís per enviar accés a aquest usuari' }
    }

    const normalizedEmail = normalizeEmail(profile.email || '')
    if (!normalizedEmail) {
      return { error: 'Aquest perfil no té correu electrònic' }
    }

    let adminClient
    try {
      adminClient = createAdminClient()
    } catch {
      return { error: 'Falta SUPABASE_SERVICE_ROLE_KEY a les variables d\'entorn del servidor.' }
    }

    let targetUserId = userId
    const { data: canonical } = await adminClient
      .from('profiles')
      .select('id')
      .eq('school_id', adminProfile.school_id)
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (canonical?.id) targetUserId = canonical.id

    const tempPassword = Math.random().toString(36).slice(-8)

    // Comprovar que existeix a Auth; si no, recrear-lo vinculat al mateix profile.id
    const { data: authLookup, error: authLookupError } =
      await adminClient.auth.admin.getUserById(targetUserId)

    if (authLookupError || !authLookup?.user) {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        id: targetUserId,
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        app_metadata: { role: profile.role, school_id: adminProfile.school_id },
        user_metadata: { full_name: profile.full_name || '' },
      })

      if (createError || !created.user) {
        return {
          error:
            createError?.message ||
            'Aquest usuari no existeix a Auth. Torna a crear-lo des d\'Equip o Superadmin.',
        }
      }
    } else {
      const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
        password: tempPassword,
        email: normalizedEmail,
        email_confirm: true,
      })

      if (updateError) {
        return { error: `No s'ha pogut actualitzar la contrasenya: ${updateError.message}` }
      }
    }

    try {
      await sendAccessEmail({
        to: normalizedEmail,
        fullName: profile.full_name || '',
        tempPassword,
        role: profile.role,
      })
    } catch (emailError) {
      const message =
        emailError instanceof Error ? emailError.message : 'No s\'ha pogut enviar el correu'
      return { error: message }
    }

    const { error: dbError } = await adminClient
      .from('profiles')
      .update({
        force_password_reset: true,
        welcome_email_sent: true,
        email: normalizedEmail,
      })
      .eq('id', targetUserId)

    if (dbError) {
      return {
        error: `Correu enviat, però no s'ha pogut actualitzar el perfil: ${dbError.message}`,
      }
    }

    const { data: linkedStudents } = await adminClient
      .from('student_guardians')
      .select('student_id')
      .eq('guardian_id', targetUserId)

    revalidatePath('/dashboard/equipo')
    revalidatePath('/dashboard/config/alumnos')
    for (const row of linkedStudents || []) {
      revalidatePath(`/dashboard/config/alumnos/${row.student_id}`)
    }

    return { success: true, emailSent: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error inesperat en enviar l\'accés'
    console.error('[sendWelcomeEmail]', e)
    return { error: message }
  }
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