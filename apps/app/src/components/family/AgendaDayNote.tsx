'use client'

import { MessageCircle } from 'lucide-react'

export function AgendaDayNote({
  note,
  title,
}: {
  note?: string | null
  title: string
}) {
  if (!note?.trim()) return null

  return (
    <div className="bg-white border border-blue-200/50 rounded-[28px] overflow-hidden shadow-xs">
      <div className="bg-blue-500/90 px-4 py-2.5 flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5 text-white" />
        <h3 className="text-[11px] font-black uppercase text-white tracking-wider">{title}</h3>
      </div>
      <div className="p-5 bg-blue-50/30">
        <p className="text-sm font-bold text-stone-800 leading-relaxed italic whitespace-pre-wrap">
          &ldquo;{note}&rdquo;
        </p>
      </div>
    </div>
  )
}
