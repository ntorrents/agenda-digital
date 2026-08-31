import { getSuperadminDb } from '@/lib/superadmin'
import { SchoolsListClient } from '@/components/superadmin/SchoolsListClient'

export default async function SuperadminSchoolsList() {
  const supabase = await getSuperadminDb()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug, email, created_at, settings')
    .order('created_at', { ascending: false })

  const withCounts = await Promise.all(
    (schools || []).map(async (school) => {
      const [{ count: studentCount }, { count: staffCount }] = await Promise.all([
        supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'active'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .in('role', ['admin', 'teacher', 'auxiliary']),
      ])
      return {
        id: school.id,
        name: school.name,
        slug: school.slug,
        email: school.email,
        created_at: school.created_at,
        settings: school.settings as Record<string, unknown> | null,
        students: [{ count: studentCount || 0 }],
        staff: [{ count: staffCount || 0 }],
      }
    })
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Escoles</h2>
        <p className="text-stone-500 text-sm mt-1">Alta, cerca i accés a la gestió de cada centre.</p>
      </div>
      <SchoolsListClient schools={withCounts} />
    </div>
  )
}
