import { PetitDiariLoader } from '@/components/ui/PetitDiariLoader'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <PetitDiariLoader message="Carregant..." fullScreen />
    </div>
  )
}
