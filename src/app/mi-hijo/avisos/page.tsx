'use client'

import { Bell, Calendar } from 'lucide-react'

export default function FamilyNoticesPage() {
  const notices = [
    { id: 1, title: 'Festa de la Primavera', date: 'Ahir, 10:30', desc: 'Divendres vinent celebrarem la festa de benvinguda a la primavera. Podeu portar els infants amb roba de colors alegres!', type: 'event', icon: Calendar },
    { id: 2, title: 'Recordatori: Roba de recanvi', date: 'Dilluns passat', desc: 'Us recordem que cal portar una muda completa de recanvi marcada amb el nom de l’infant.', type: 'notice', icon: Bell },
  ]

  return (
    <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Bell className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Avisos i Esdeveniments</h2>
      </div>

      <div className="space-y-3">
        {notices.map((notice) => (
          <div key={notice.id} className="rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${notice.type === 'event' ? 'bg-teal-50 text-teal-700 ring-4 ring-teal-50/50' : 'bg-amber-50 text-amber-600 ring-4 ring-amber-50/50'}`}>
                <notice.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">{notice.title}</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">{notice.date}</p>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-medium leading-relaxed">
              {notice.desc}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
