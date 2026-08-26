'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smile, Utensils, Moon, ChevronRight } from 'lucide-react'

interface StudentItem {
  id: string
  first_name: string
  last_name: string
  allergies: string | null
  hasLogToday: boolean
}

export default function StudentsListPage() {
  const router = useRouter()
  
  const [students] = useState<StudentItem[]>([
    {
      id: '66666666-6666-6666-6666-666666666661',
      first_name: 'Nil',
      last_name: 'Puig Valls',
      allergies: null,
      hasLogToday: true,
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      first_name: 'Mia',
      last_name: 'Vila Gómez',
      allergies: 'Intolerància a la lactosa',
      hasLogToday: true,
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      first_name: 'Leo',
      last_name: 'Martín Costa',
      allergies: null,
      hasLogToday: false,
    },
  ])

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-wider text-stone-400">
          Alumnes ({students.length})
        </h2>
        <span className="text-xs text-stone-400 font-medium hidden sm:inline">Toca un alumne per obrir l&apos;agenda</span>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            onClick={() => router.push(`/mi-aula/alumnos/${student.id}`)}
            className="rounded-[24px] border border-stone-200/80 bg-white shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] p-4.5"
          >
            <div className="flex items-center justify-between">
              
              {/* Student Info */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100/80 text-teal-800 font-black text-lg shrink-0">
                  {student.first_name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-tight">
                    {student.first_name} {student.last_name}
                  </h3>
                  {student.allergies ? (
                    <p className="text-[11px] font-bold text-orange-600 mt-0.5">
                      ⚠️ {student.allergies}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Sense al·lèrgies
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badges & Action */}
              <div className="flex items-center gap-2">
                {student.hasLogToday ? (
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 text-xs ring-2 ring-teal-50/50" title="Estat d'ànim">
                      <Smile className="h-4 w-4" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xs ring-2 ring-orange-50/50" title="Dinar">
                      <Utensils className="h-4 w-4" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xs ring-2 ring-emerald-50/50" title="Migdiada">
                      <Moon className="h-4 w-4" />
                    </span>
                  </div>
                ) : (
                  <span className="bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] rounded-full px-2.5 py-1 font-bold">
                    Pendent
                  </span>
                )}

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-teal-700 hover:text-white shrink-0 ml-2">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
