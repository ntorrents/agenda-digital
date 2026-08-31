import { getSuperadminDb } from '@/lib/superadmin'
import { ImportExcelClient } from '@/components/superadmin/ImportExcelClient'

export default async function SuperadminImportPage() {
  const supabase = await getSuperadminDb()
  const { data: schools } = await supabase.from('schools').select('id, name').order('name')

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-black text-white">Importació massiva (Excel)</h2>
        <p className="text-stone-500 text-sm mt-1">
          Selecciona un centre ja creat, puja l&apos;Excel amb les 3 fulles i valida abans d&apos;importar.
        </p>
      </div>
      <ImportExcelClient schools={schools || []} />
    </div>
  )
}
