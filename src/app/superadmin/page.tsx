import { createClient } from '@/lib/supabase/server'
import { Building, Users, GraduationCap, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function SuperadminDashboard() {
  const supabase = await createClient()

  // 1. Fetch total schools
  const { count: schoolsCount } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true })

  // 2. Fetch total students (active)
  const { count: studentsCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 3. Fetch total teachers
  const { count: teachersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher')

  // 4. Fetch recent schools
  const { data: recentSchools } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fake MRR Calculation: let's say we charge 2€ per active student per month
  const pricePerStudent = 2
  const mrr = (studentsCount || 0) * pricePerStudent

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Panoràmica Global</h2>
        <p className="text-stone-400 mt-1 text-sm">Resum de l'estat del negoci i ús de l'aplicació.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24 text-emerald-500 transform translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-400">MRR Estimat</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">{mrr.toLocaleString('ca-ES')}</span>
            <span className="text-emerald-400 font-bold">€</span>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-medium">Basat en {pricePerStudent}€ per alumne actiu</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Building className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-400">Escoles Actives</h3>
          </div>
          <div className="text-4xl font-black text-white">
            {schoolsCount || 0}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-400">Alumnes (Total)</h3>
          </div>
          <div className="text-4xl font-black text-white">
            {studentsCount || 0}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-stone-400">Educadors</h3>
          </div>
          <div className="text-4xl font-black text-white">
            {teachersCount || 0}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Schools */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-[28px] overflow-hidden">
          <div className="p-6 border-b border-stone-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-stone-400" /> Últimes Escoles Registrades
            </h3>
            <Link href="/superadmin/escoles" className="text-sm font-medium text-violet-400 hover:text-violet-300">
              Veure totes &rarr;
            </Link>
          </div>
          <div className="divide-y divide-stone-800/50">
            {recentSchools?.map((school) => (
              <div key={school.id} className="p-4 px-6 flex items-center justify-between hover:bg-stone-800/50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-stone-200">{school.name}</h4>
                  <p className="text-xs text-stone-500 font-medium">Id: {school.id.substring(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                    Activa
                  </span>
                  <Link href={`/superadmin/escoles/${school.id}`} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-lg transition-colors">
                    Gestionar
                  </Link>
                </div>
              </div>
            ))}
            {(!recentSchools || recentSchools.length === 0) && (
              <div className="p-8 text-center text-stone-500 text-sm">
                No hi ha escoles registrades.
              </div>
            )}
          </div>
        </div>

        {/* System Activity (Mocked for now) */}
        <div className="bg-stone-900 border border-stone-800 rounded-[28px] overflow-hidden">
          <div className="p-6 border-b border-stone-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-stone-400" /> Activitat del Sistema
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-stone-800">
              
              <div className="relative pl-8">
                <div className="absolute left-0 h-5 w-5 bg-stone-900 border-2 border-emerald-500 rounded-full"></div>
                <p className="text-sm font-bold text-stone-300">Respatller diari completat</p>
                <p className="text-xs text-stone-500 mt-1">Avui a les 04:00 AM</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 h-5 w-5 bg-stone-900 border-2 border-violet-500 rounded-full"></div>
                <p className="text-sm font-bold text-stone-300">Nova escola: "Llar d'Infants Sol"</p>
                <p className="text-xs text-stone-500 mt-1">Ahir a les 18:30 PM</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 h-5 w-5 bg-stone-900 border-2 border-amber-500 rounded-full"></div>
                <p className="text-sm font-bold text-stone-300">14 nous educadors convidats</p>
                <p className="text-xs text-stone-500 mt-1">Fa 2 dies</p>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
