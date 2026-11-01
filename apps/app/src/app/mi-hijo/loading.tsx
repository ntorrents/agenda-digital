import { PageContentSkeleton } from '@/components/ui/skeleton'

/** Loading del segmento /mi-hijo (home). Las subrutas tienen su propio loading.tsx */
export default function FamilyLoading() {
  return <PageContentSkeleton variant="home" />
}
