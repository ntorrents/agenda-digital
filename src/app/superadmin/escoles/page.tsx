import { getSuperadminDb } from '@/lib/superadmin'
import Link from 'next/link'
import { Building, Plus, Search, ExternalLink } from 'lucide-react'

export default async function SuperadminSchoolsList() {
  const supabase = await getSuperadminDb()

  // Fetch all schools
  const { data: schools } = await supabase
    .from('schools')
    .select(`
      id,
      name,
      address,
      phone,
      created_at,
      settings,
      students:students(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Escoles (Clients)</h2>
          <p className="text-stone-400 mt-1 text-sm">Gestiona els centres donats d'alta al sistema.</p>
        </div>
        <div className="flex gap-2">
          {/* Quick search UI placeholder */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input 
              type="text" 
              placeholder="Cercar escola..."
              className="pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all w-64"
            />
          </div>
          
          {/* This button should open a modal to create a school, or navigate to a creation page */}
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Escola
          </button>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-900/50 border-b border-stone-800 text-stone-400 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Nom de l'Escola</th>
                <th className="px-6 py-4">Alumnes</th>
                <th className="px-6 py-4">Data d'Alta</th>
                <th className="px-6 py-4">Estat</th>
                <th className="px-6 py-4 text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {schools?.map(school => (
                <tr key={school.id} className="hover:bg-stone-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-stone-800 rounded-xl flex items-center justify-center shrink-0">
                        <Building className="h-5 w-5 text-stone-400" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-200 text-sm">{school.name}</div>
                        <div className="text-xs text-stone-500">{school.id.substring(0,8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-300 font-medium">
                      {(school.students as any[])[0]?.count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-400">
                      {new Date(school.created_at).toLocaleDateString('ca-ES')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Activa
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/superadmin/escoles/${school.id}`}
                        className="p-2 text-stone-400 hover:text-violet-400 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors tooltip"
                        title="Gestionar"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {(!schools || schools.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500 text-sm">
                    No hi ha cap escola donada d'alta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
