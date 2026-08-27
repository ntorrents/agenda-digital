import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'educadora@bressol.cat',
    password: '123456'
  })

  if (signInError) {
    console.error('Sign in error:', signInError.message)
    return
  }
  
  console.log('User ID:', user.id)

  const { data: profile, error: profError } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()
    
  console.log('Profile:', profile, profError)

  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('teacher_id', user.id)
    .single()
    
  console.log('Classroom:', classroom, classError?.message)

  if (classroom) {
    const { data: students, error: studError } = await supabase
      .from('students')
      .select('id, first_name')
      .eq('classroom_id', classroom.id)
      
    console.log('Students:', students, studError?.message)
  }
}

run()
