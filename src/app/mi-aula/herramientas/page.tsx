'use client'

import { Wrench, CheckSquare, Utensils, MessageSquare } from 'lucide-react'

export default function EducatorToolsPage() {
  const tools = [
    { title: 'Marcar tots com a presents', desc: 'Registra l\'assistència de tots els alumnes no marcats com absents.', icon: CheckSquare, color: 'emerald' },
    { title: 'Dinar per defecte', desc: 'Posa "S\'ho ha menjat tot" a tots els presents.', icon: Utensils, color: 'orange' },
    { title: 'Nota global', desc: 'Escriu una nota que apareixerà a l\'agenda de tots els alumnes.', icon: MessageSquare, color: 'teal' },
  ]

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Wrench className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Eines de Productivitat</h2>
      </div>

      <div className="space-y-3">
        {tools.map((tool, idx) => (
          <button key={idx} className="w-full text-left rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-${tool.color}-50 text-${tool.color}-600 group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-800">{tool.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{tool.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}
