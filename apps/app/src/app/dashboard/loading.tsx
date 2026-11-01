import { PageContentSkeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="px-1">
      <PageContentSkeleton variant="cards" />
    </div>
  )
}
