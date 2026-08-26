'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardAulasPage() {
  const router = useRouter()

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Aules del Centre</h3>
          <p className="text-xs text-stone-400">Seguiment per grups d&apos;edat</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-2xl text-xs font-bold text-teal-800 border-teal-200 bg-teal-50/50 hover:bg-teal-100 cursor-pointer h-9">
          <Plus className="h-3.5 w-3.5 mr-1 text-teal-700" /> Nova aula
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Aula 1: Gira-sols */}
        <div 
          onClick={() => router.push('/mi-aula')}
          className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-700 transition-colors">
                  Aula Gira-sols
                </h4>
                <span className="bg-teal-50 text-teal-800 border border-teal-200/80 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                  I1 (1-2 anys)
                </span>
              </div>
              <p className="text-xs text-stone-500">Educadora: <strong className="text-stone-700">Clara Soler</strong></p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-teal-700 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>3 alumnes inscrits</span>
            <span className="font-bold text-emerald-600">3 presents avui</span>
          </div>
        </div>

        {/* Aula 2: Baldufes */}
        <div 
          onClick={() => router.push('/mi-aula')}
          className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-700 transition-colors">
                  Aula Baldufes
                </h4>
                <span className="bg-orange-50 text-orange-800 border border-orange-200/80 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                  I2 (2-3 anys)
                </span>
              </div>
              <p className="text-xs text-stone-500">Educadora: <span className="text-stone-400 italic">Pendent d&apos;assignar</span></p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-teal-700 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>1 alumne inscrit</span>
            <span className="font-bold text-emerald-600">1 present avui</span>
          </div>
        </div>

      </div>
    </main>
  )
}
