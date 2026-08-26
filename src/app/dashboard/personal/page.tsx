'use client'

import { Users } from 'lucide-react'

export default function DashboardPersonalPage() {
  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Users className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Personal del Centre</h2>
      </div>

      <div className="rounded-[28px] border border-stone-200/80 bg-white p-5 shadow-xs text-center space-y-3">
        <Users className="h-8 w-8 text-stone-300 mx-auto" />
        <h3 className="text-sm font-bold text-stone-700">En construcció</h3>
        <p className="text-xs text-stone-500">Aquesta secció permetrà gestionar l&apos;equip educatiu, assignar aules i permisos.</p>
      </div>
    </main>
  )
}
