'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStaffMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string // 'admin' or 'teacher'
  const password = formData.get('password') as string || '123456'

  if (!fullName || !email || !role) {
    throw new Error('Missing required fields')
  }

  // Use the RPC to securely create the auth user and profile
  const { data, error } = await supabase.rpc('create_staff_user', {
    p_email: email,
    p_full_name: fullName,
    p_role: role,
    p_password: password
  })

  if (error) {
    console.error('Error creating staff:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/personal')
  return { success: true }
}

export async function createClassroom(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

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

  if (!name || !level) throw new Error('Missing required fields')

  const payload = {
    school_id: profile.school_id,
    name,
    level,
    capacity,
    teacher_id: teacherId === 'none' ? null : teacherId,
    is_active: true
  }

  const { error } = await supabase
    .from('classrooms')
    .insert([payload])

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/aulas')
  return { success: true }
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const dob = formData.get('date_of_birth') as string
  const classroomId = formData.get('classroom_id') as string

  if (!firstName || !lastName || !dob) throw new Error('Missing required fields')

  const payload = {
    school_id: profile.school_id,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dob,
    classroom_id: classroomId === 'none' ? null : classroomId,
  }

  const { error } = await supabase
    .from('students')
    .insert([payload])

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/alumnos')
  return { success: true }
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/alumnos')
  return { success: true }
}
