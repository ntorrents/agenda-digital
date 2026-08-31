import { cn } from '@/lib/utils'

export const PETIT_DIARI_LOGO_SRC = '/logo-petit-diari.svg'

const avatarSizes = {
  xs: 'h-7 w-7 rounded-full p-1',
  sm: 'h-9 w-9 rounded-full p-1.5',
  md: 'h-10 w-10 rounded-2xl p-2',
  sidebar: 'h-12 w-12 rounded-[1.2rem] p-2.5',
  lg: 'h-16 w-16 rounded-3xl p-3',
} as const

type AvatarSize = keyof typeof avatarSizes

/** Logo en contenidor rodó/cuadrado (avatars de família, direcció, educador). */
export function PetitDiariBrandAvatar({
  size = 'md',
  className,
}: {
  size?: AvatarSize
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-white border border-stone-200/80 shadow-sm shrink-0 overflow-hidden',
        avatarSizes[size],
        className
      )}
    >
      <img
        src={PETIT_DIARI_LOGO_SRC}
        alt="Petit Diari"
        className="h-full w-full object-contain"
      />
    </div>
  )
}

/** Marca principal en pantalles d'auth (login, etc.). */
export function PetitDiariBrandHero({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-stone-200/80 shadow-xl shadow-stone-200/40 mb-1 ring-8 ring-[#0f766e]/10 p-3">
        <img
          src={PETIT_DIARI_LOGO_SRC}
          alt="Petit Diari"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

/** Logo inline (sense contenidor), com a la web. */
export function PetitDiariLogo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
  return (
    <img
      src={PETIT_DIARI_LOGO_SRC}
      alt="Petit Diari"
      className={cn(heights[size], 'w-auto object-contain', className)}
    />
  )
}
