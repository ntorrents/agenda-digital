import { SuperadminUsersClient } from '@/components/superadmin/SuperadminUsersClient'

export default function SuperadminUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Usuaris</h2>
        <p className="text-stone-500 text-sm mt-1">
          Cerca global per email o nom. Entra com a directora o educador amb enllaç segur.
        </p>
      </div>
      <SuperadminUsersClient />
    </div>
  )
}
