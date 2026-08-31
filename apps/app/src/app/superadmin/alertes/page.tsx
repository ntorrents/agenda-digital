import { fetchOperationalHealth } from '@/lib/superadmin-health'
import { SuperadminAlertsClient } from '@/components/superadmin/SuperadminAlertsClient'

export default async function SuperadminAlertsPage() {
  const { alerts } = await fetchOperationalHealth()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Alertes operatives</h2>
        <p className="text-stone-500 text-sm mt-1">
          Contractes, accés de direcció, factures vençudes i ús de l&apos;agenda.
        </p>
      </div>
      <SuperadminAlertsClient alerts={alerts} />
    </div>
  )
}
