<<<<<<< HEAD
import { PageContentSkeleton } from '@/components/ui/skeleton'

/** Loading del segmento /mi-hijo (home). Las subrutas tienen su propio loading.tsx */
export default function FamilyLoading() {
  return <PageContentSkeleton variant="home" />
=======
export default function FamilyLoading() {
  // Contenido suave: el layout ya está visible; no tapa toda la app.
  return (
    <div className="pt-6 space-y-4 animate-pulse max-w-md mx-auto w-full" aria-hidden>
      <div className="h-8 w-2/3 mx-auto rounded-xl bg-stone-200/50" />
      <div className="h-4 w-1/2 mx-auto rounded-lg bg-stone-200/40" />
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="h-28 rounded-[28px] bg-stone-200/40" />
        <div className="h-28 rounded-[28px] bg-stone-200/40" />
        <div className="h-28 rounded-[28px] bg-stone-200/35" />
        <div className="h-28 rounded-[28px] bg-stone-200/35" />
      </div>
    </div>
  )
>>>>>>> origin/cursor/fase-7-shell-instantaneo-prefetch-60b9
}
