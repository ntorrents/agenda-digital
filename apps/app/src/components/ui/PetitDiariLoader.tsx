'use client'

import { cn } from '@/lib/utils'

type PetitDiariLoaderProps = {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function PetitDiariLoader({ message, fullScreen = false, className }: PetitDiariLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5',
        fullScreen && 'min-h-[50vh] sm:min-h-[60vh]',
        className
      )}
    >
      <div className="relative h-[72px] w-[72px]" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-teal-600/20 animate-pd-spin" />
        <span className="absolute inset-2 rounded-full border-2 border-dashed border-teal-500/40 animate-pd-spin-reverse" />
        <div className="absolute inset-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 shadow-lg shadow-teal-900/30 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-y-2 left-1/2 w-px bg-white/25" />
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute left-3 right-3 h-0.5 rounded-full bg-white/50 origin-left animate-pd-line"
              style={{
                top: `${28 + i * 14}%`,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
          <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-amber-300 animate-pd-pulse" />
        </div>
      </div>
      {message && (
        <p className="text-xs font-bold text-stone-500 tracking-wide animate-pulse">{message}</p>
      )}
    </div>
  )
}
