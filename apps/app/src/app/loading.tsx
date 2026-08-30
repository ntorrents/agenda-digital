import { PetitDiariLoader } from '@/components/ui/PetitDiariLoader'

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] p-8">
      <PetitDiariLoader message="Carregant Petit Diari..." fullScreen />
    </div>
  )
}
