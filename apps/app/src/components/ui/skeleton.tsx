import { cn } from '@/lib/utils'

/** Bloque base con shimmer suave (sin spinner). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-stone-200/80',
        className
      )}
      aria-hidden
    />
  )
}

/** Página genérica: título + bloques de contenido. */
export function PageContentSkeleton({
  variant = 'cards',
}: {
  variant?: 'cards' | 'list' | 'grid' | 'form' | 'home'
}) {
  if (variant === 'home') {
    return (
      <div className="pt-4 pb-8 flex flex-col items-center w-full" aria-busy="true" aria-label="Cargando">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="text-center space-y-2 flex flex-col items-center">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60"
              >
                <Skeleton className="h-16 w-16 rounded-[20px]" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="space-y-6 pt-4" aria-busy="true" aria-label="Cargando">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
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
      <div className="space-y-4 pt-4" aria-busy="true" aria-label="Cargando">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[24px] border border-stone-200/70 bg-white p-4 flex gap-3 items-center"
            >
              <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-3 w-[50%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div className="space-y-6 pt-4 max-w-2xl" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-[32px] border border-stone-200/80 bg-white p-5 space-y-5">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-[20px]" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // cards (agenda / default)
  return (
    <div className="space-y-6 pt-4" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[28px] border border-stone-200/70 bg-white p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <Skeleton className="h-16 w-16 rounded-xl" />
              <Skeleton className="h-16 w-16 rounded-xl" />
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
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-stone-200/80 bg-white p-6 gap-4 z-30">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </aside>
      )}

      <header className="sticky top-0 z-20 bg-[#faf8f5]/90 backdrop-blur border-b border-stone-200/60 px-4 py-3 flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-9 rounded-xl lg:hidden" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 w-full max-w-5xl mx-auto">
        <PageContentSkeleton variant="cards" />
      </main>
    </div>
  )
}
