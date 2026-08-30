'use client'

import { MessageCircle } from 'lucide-react'
import { LightboxImage } from '@/components/media/LightboxImage'

export function AgendaDayNote({
  note,
  photoUrl,
  title,
  photoAlt,
}: {
  note?: string | null
  photoUrl?: string | null
  title: string
  photoAlt: string
}) {
  if (!note && !photoUrl) return null

  return (
    <div className="bg-white border border-blue-200/50 rounded-[28px] overflow-hidden shadow-xs">
      <div className="bg-blue-500/90 px-4 py-2.5 flex items-center gap-2">
        <MessageCircle className="h-3.5 w-3.5 text-white" />
        <h3 className="text-[11px] font-black uppercase text-white tracking-wider">{title}</h3>
      </div>
      <div className="p-5 bg-blue-50/30">
        <div className="text-sm font-bold text-stone-800 leading-relaxed italic whitespace-pre-wrap">
          {note && <p className={photoUrl ? 'mb-4' : ''}>&ldquo;{note}&rdquo;</p>}
          {photoUrl && (
            <LightboxImage src={photoUrl} alt={photoAlt} />
          )}
        </div>
      </div>
    </div>
  )
}
