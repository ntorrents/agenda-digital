import { getSuperadminDb } from '@/lib/superadmin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Building, Users, GraduationCap, ChevronLeft, LayoutGrid, AlertTriangle } from 'lucide-react'

export default async function SuperadminSchoolDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const schoolId = params.id

  const supabase = await getSuperadminDb()

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  if (!school) notFound()

  const { count: classroomsCount } = await supabase.from('classrooms').select('*', { count: 'exact', head: true }).eq('school_id', schoolId)
  const { count: teachersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher')
  const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Back & Header */}
      <div className="space-y-4">
        <Link href="/superadmin/escoles" className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-stone-300 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Tornar a Escoles
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-stone-800 rounded-2xl flex items-center justify-center border border-stone-700">
              <Building className="h-8 w-8 text-stone-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{school.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-stone-400">
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest border border-emerald-500/20">
                  Activa
                </span>
                <span>ID: {school.id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-stone-700">
              Editar Dades
            </button>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-red-500/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Bloquejar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-400">Aules</h3>
            <div className="text-2xl font-black text-white">{classroomsCount || 0}</div>
          </div>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-400">Educadors</h3>
            <div className="text-2xl font-black text-white">{teachersCount || 0}</div>
          </div>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded-[24px] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-400">Alumnes</h3>
            <div className="text-2xl font-black text-white">{studentsCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs Placeholder for Aulas, Profesores, Alumnos */}
      <div className="bg-stone-900 border border-stone-800 rounded-[28px] overflow-hidden min-h-[400px]">
        <div className="border-b border-stone-800 px-6 flex gap-6">
          <button className="border-b-2 border-violet-500 text-white py-4 text-sm font-bold">
            Resum i Opcions
          </button>
          <button className="border-b-2 border-transparent text-stone-500 hover:text-stone-300 py-4 text-sm font-bold transition-colors">
            Aules
          </button>
          <button className="border-b-2 border-transparent text-stone-500 hover:text-stone-300 py-4 text-sm font-bold transition-colors">
            Personal
          </button>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-bold text-white mb-4">Eines d'Administració</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Link href="/superadmin/importar" className="block p-6 rounded-2xl border border-stone-800 bg-stone-900/50 hover:bg-stone-800 transition-colors group">
              <h4 className="text-stone-200 font-bold mb-1 group-hover:text-violet-400 transition-colors">Importació Massiva (Excel)</h4>
              <p className="text-xs text-stone-500">Inyecta aulas, profesores y alumnos de golpe con un archivo Excel.</p>
            </Link>
            
            <div className="block p-6 rounded-2xl border border-stone-800 bg-stone-900/50 hover:bg-stone-800 transition-colors cursor-pointer group">
              <h4 className="text-stone-200 font-bold mb-1 group-hover:text-violet-400 transition-colors">Afegir Aula</h4>
              <p className="text-xs text-stone-500">Crear una nueva clase manualmente para este centro.</p>
            </div>
            
            <div className="block p-6 rounded-2xl border border-stone-800 bg-stone-900/50 hover:bg-stone-800 transition-colors cursor-pointer group">
              <h4 className="text-stone-200 font-bold mb-1 group-hover:text-violet-400 transition-colors">Afegir Personal</h4>
              <p className="text-xs text-stone-500">Dar de alta a un director o educador manualmente.</p>
            </div>
            
          </div>
        </div>
      </div>

    </div>
  )
}
