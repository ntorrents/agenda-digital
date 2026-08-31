'use server'

import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit-log'
import { upsertGuardianForStudent } from '@/lib/guardian-link'
import {
  buildImportTemplateBuffer,
  parseImportWorkbook,
  type ParsedImport,
} from '@/lib/superadmin-import'
import { requireSuperadmin } from '@/lib/superadmin-auth'
import { DEFAULT_STAFF_PASSWORD } from '@/lib/superadmin-constants'

function revalidateImport(schoolId: string) {
  revalidatePath('/superadmin/importar')
  revalidatePath('/superadmin/logs')
  revalidatePath('/superadmin/escoles')
  revalidatePath(`/superadmin/escoles/${schoolId}`)
}

export async function getImportTemplateBase64() {
  await requireSuperadmin()
  const buf = buildImportTemplateBuffer()
  return { data: buf.toString('base64'), filename: 'plantilla-importacio-petit-diari.xlsx' }
}

export async function validateSchoolImport(schoolId: string, formData: FormData) {
  const { admin } = await requireSuperadmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Selecciona un arxiu Excel (.xlsx)' }

  const buffer = await file.arrayBuffer()
  const { data, errors: parseErrors } = parseImportWorkbook(buffer)
  const errors = [...parseErrors]

  if (!data) {
    return { errors, preview: null }
  }

  // Comprovacions contra BD
  for (let i = 0; i < data.staff.length; i++) {
    const s = data.staff[i]
    const { data: profile } = await admin
      .from('profiles')
      .select('school_id')
      .eq('email', s.email)
      .maybeSingle()
    if (profile && profile.school_id !== schoolId) {
      errors.push({
        sheet: 'Educadors',
        row: i + 2,
        field: 'Email',
        message: `${s.email} ja pertany a un altre centre`,
      })
    }
  }

  for (let i = 0; i < data.students.length; i++) {
    const st = data.students[i]
    if (!st.guardianEmail) continue
    const { data: profile } = await admin
      .from('profiles')
      .select('school_id, role')
      .eq('email', st.guardianEmail)
      .maybeSingle()
    if (profile && profile.school_id !== schoolId) {
      errors.push({
        sheet: 'Alumnes',
        row: i + 2,
        field: 'Email_Familiar',
        message: `${st.guardianEmail} ja pertany a un altre centre`,
      })
    }
    if (profile && !['guardian', 'superadmin'].includes(profile.role || '')) {
      errors.push({
        sheet: 'Alumnes',
        row: i + 2,
        field: 'Email_Familiar',
        message: `${st.guardianEmail} ja és personal d'un centre (no tutor)`,
      })
    }
  }

  if (errors.length) {
    return { errors, preview: null }
  }

  return {
    errors: [],
    preview: {
      classrooms: data.classrooms.length,
      staff: data.staff.length,
      students: data.students.length,
    },
    parsedJson: JSON.stringify(data),
  }
}

export async function executeSchoolImport(schoolId: string, parsedJson: string) {
  const { admin, actorId } = await requireSuperadmin()

  let parsed: ParsedImport
  try {
    parsed = JSON.parse(parsedJson) as ParsedImport
  } catch {
    return { error: 'Dades d\'importació invàlides. Torna a pujar l\'arxiu.' }
  }

  const { data: school } = await admin.from('schools').select('id').eq('id', schoolId).single()
  if (!school) return { error: 'Escola no trobada' }

  const classroomIdByName = new Map<string, string>()
  const staffIdByEmail = new Map<string, string>()

  // 1. Aules
  for (const c of parsed.classrooms) {
    const { data: existing } = await admin
      .from('classrooms')
      .select('id')
      .eq('school_id', schoolId)
      .ilike('name', c.name)
      .maybeSingle()

    if (existing) {
      classroomIdByName.set(c.name.toLowerCase(), existing.id)
      continue
    }

    const { data: inserted, error } = await admin
      .from('classrooms')
      .insert({
        school_id: schoolId,
        name: c.name,
        level: c.level,
        capacity: c.capacity,
        status: 'active',
        auxiliary_teacher_ids: [],
      })
      .select('id')
      .single()

    if (error) return { error: `Error creant aula "${c.name}": ${error.message}` }
    classroomIdByName.set(c.name.toLowerCase(), inserted.id)
  }

  // 2. Personal
  for (const s of parsed.staff) {
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', s.email).maybeSingle()

    if (existingProfile) {
      if (s.classroomName) {
        const cid = classroomIdByName.get(s.classroomName.toLowerCase())
        if (cid && s.role === 'teacher') {
          await admin.from('classrooms').update({ teacher_id: existingProfile.id }).eq('id', cid)
        }
      }
      staffIdByEmail.set(s.email, existingProfile.id)
      continue
    }

    const password = s.password || DEFAULT_STAFF_PASSWORD
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: s.email,
      password,
      email_confirm: true,
      app_metadata: { role: s.role, school_id: schoolId },
      user_metadata: { full_name: s.fullName },
    })

    if (authError || !authData.user) {
      return { error: `Error creant ${s.email}: ${authError?.message || 'auth'}` }
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: authData.user.id,
      school_id: schoolId,
      role: s.role,
      full_name: s.fullName,
      email: s.email,
      status: 'active',
      force_password_reset: true,
      welcome_email_sent: false,
    })

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return { error: `Error perfil ${s.email}: ${profileError.message}` }
    }

    staffIdByEmail.set(s.email, authData.user.id)

    if (s.classroomName && s.role === 'teacher') {
      const cid = classroomIdByName.get(s.classroomName.toLowerCase())
      if (cid) {
        await admin.from('classrooms').update({ teacher_id: authData.user.id }).eq('id', cid)
      }
    }
  }

  // 3. Alumnes + tutors
  let studentsCreated = 0
  for (const st of parsed.students) {
    const classroomId = st.classroomName
      ? classroomIdByName.get(st.classroomName.toLowerCase()) || null
      : null

    const { data: inserted, error } = await admin
      .from('students')
      .insert({
        school_id: schoolId,
        first_name: st.firstName,
        last_name: st.lastName,
        date_of_birth: st.dateOfBirth,
        gender: st.gender,
        classroom_id: classroomId,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) {
      return { error: `Error alumne ${st.firstName} ${st.lastName}: ${error.message}` }
    }

    studentsCreated++

    if (st.guardianEmail && st.guardianName) {
      try {
        await upsertGuardianForStudent(admin, {
          studentId: inserted.id,
          schoolId,
          guardian: {
            name: st.guardianName,
            email: st.guardianEmail,
            relation: st.guardianRelation,
          },
        })
      } catch (e) {
        return {
          error: `Alumne creat però error tutor ${st.guardianEmail}: ${e instanceof Error ? e.message : 'desconegut'}`,
        }
      }
    }
  }

  await logAudit({
    actorId,
    action: 'import.execute',
    entityType: 'school',
    entityId: schoolId,
    schoolId,
    payload: {
      classrooms: parsed.classrooms.length,
      staff: parsed.staff.length,
      students: studentsCreated,
    },
  })

  revalidateImport(schoolId)
  return {
    success: true,
    summary: {
      classrooms: parsed.classrooms.length,
      staff: parsed.staff.length,
      students: studentsCreated,
    },
  }
}
