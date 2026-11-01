import { cn } from '@/lib/utils'

/** Bloque base: gris difuminado + shimmer suave (sin bordes duros). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl animate-pd-shimmer',
        'bg-stone-200/40',
        className
      )}
      aria-hidden
    />
  )
}

/** Página genérica: silueta ligera del contenido que va a aparecer. */
export function PageContentSkeleton({
  variant = 'cards',
}: {
  variant?: 'cards' | 'list' | 'grid' | 'form' | 'home'
}) {
  if (variant === 'home') {
    return (
      <div
        className="pt-6 pb-8 flex flex-col items-center w-full opacity-90"
        aria-busy="true"
        aria-label="Cargando"
      >
        <div className="w-full max-w-sm mx-auto space-y-7">
          <div className="flex flex-col items-center gap-2.5">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-3.5 w-52 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-[22px]" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 py-4">
                <Skeleton className="h-14 w-14 rounded-[18px]" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="space-y-5 pt-5 opacity-90" aria-busy="true" aria-label="Cargando">
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-3.5 w-52 max-w-full rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="space-y-5 pt-5 opacity-90" aria-busy="true" aria-label="Cargando">
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-3.5 w-48 max-w-full rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center py-1">
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-[68%] rounded-full" />
                <Skeleton className="h-3 w-[42%] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div className="space-y-5 pt-5 max-w-2xl opacity-90" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-6 w-44 rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-[18px]" />
            ))}
          </div>
          <Skeleton className="h-20 w-full rounded-[22px]" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // cards (agenda / default)
  return (
    <div className="space-y-5 pt-5 opacity-90" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-3.5 w-48 max-w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-2xl" />
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-[22px]" />
            <div className="flex gap-2">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Shell a pantalla completa mientras carga el layout (sidebar + contenido). */
export function AppShellSkeleton({ withSidebar = true }: { withSidebar?: boolean }) {
  return (
    <div
      className={cn(
        'min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col',
        withSidebar && 'lg:pl-72'
      )}
      aria-busy="true"
      aria-label="Cargando"
    >
      {withSidebar && (
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-stone-100/80 bg-white/70 p-6 gap-3 z-30">
          <div className="flex items-center gap-3 pb-4">
            <Skeleton className="h-9 w-9 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </aside>
      )}

      <header className="sticky top-0 z-20 bg-[#faf8f5]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-8 rounded-xl lg:hidden" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 w-full max-w-5xl mx-auto">
        <PageContentSkeleton variant="cards" />
      </main>
    </div>
  )
}
