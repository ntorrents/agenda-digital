'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, School as SchoolIcon, Calendar, Bell, Sparkles, ArrowRight } from 'lucide-react'

export default function DashboardSummaryPage() {
  const router = useRouter()
  
  const todayFormatted = new Date().toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 p-6 sm:p-8 text-white shadow-xl shadow-teal-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/40 border border-teal-500/30 text-teal-100 text-xs font-semibold capitalize">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" /> {todayFormatted}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bon dia! 👋
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 font-normal max-w-lg">
              Tot el centre en marxa. Tens 4 alumnes registrats a les aules avui.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <Button
              onClick={() => router.push('/mi-aula')}
              className="rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm h-11 px-5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Veure com a Educadora <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50/50 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Alumnes Presents</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">4 / 4</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">● 100% assistència</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/aulas')}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-4 ring-orange-50/50 shrink-0">
            <SchoolIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Aules Actives</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">2 Aules</h3>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Gira-sols & Baldufes</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-4 ring-amber-50/50 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Agendes del Dia</p>
            <h3 className="text-2xl font-black text-stone-800 mt-0.5">2 / 4</h3>
            <p className="text-[11px] text-amber-600 font-bold mt-0.5">● 2 pendents</p>
          </div>
        </div>

      </div>

    </main>
  )
}
