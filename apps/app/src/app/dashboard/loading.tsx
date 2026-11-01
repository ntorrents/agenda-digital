<<<<<<< HEAD
import { PageContentSkeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="px-1">
      <PageContentSkeleton variant="cards" />
=======
export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 animate-pulse" aria-hidden>
      <div className="h-8 w-48 rounded-xl bg-stone-200/50" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="h-24 rounded-2xl bg-stone-200/40" />
        <div className="h-24 rounded-2xl bg-stone-200/40" />
        <div className="h-24 rounded-2xl bg-stone-200/35" />
        <div className="h-24 rounded-2xl bg-stone-200/35" />
      </div>
      <div className="h-40 rounded-2xl bg-stone-200/30" />
>>>>>>> origin/cursor/fase-7-shell-instantaneo-prefetch-60b9
    </div>
  )
}
