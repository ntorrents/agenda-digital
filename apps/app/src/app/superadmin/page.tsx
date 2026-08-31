import { getSuperadminDb } from '@/lib/superadmin'
import Link from 'next/link'
import {
  getEffectivePricePerStudent,
  getSchoolMonthlyPrice,
  getSchoolMrr,
  isSchoolBillingActive,
} from '@/lib/superadmin-billing'
import { fetchOperationalHealth } from '@/lib/superadmin-health'
import { computeOnboardingSteps } from '@/lib/superadmin-onboarding'
import { getCommercialFromSettings } from '@/lib/superadmin-commercial'
import { DEMO_SCHOOL_META, isDemoSchool } from '@/lib/superadmin-demo'
import { SaPanel, SaPanelHeader, SaTable } from '@/components/superadmin/sa-ui'
import { OnboardingPanel } from '@/components/superadmin/OnboardingPanel'
import { SuperadminAlertsClient } from '@/components/superadmin/SuperadminAlertsClient'

export default async function SuperadminDashboard() {
  const supabase = await getSuperadminDb()

  const [{ count: schoolsCount }, { data: schools }, { count: studentsCount }, { count: teachersCount }, health] =
    await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('schools').select('id, name, slug, settings, created_at').order('created_at', { ascending: false }),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['teacher', 'admin', 'auxiliary']),
      fetchOperationalHealth(),
    ])

  const { alerts } = health
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length

  const schoolStats = await Promise.all(
    (schools || []).map(async (school) => {
      const [{ count: activeStudents }, { count: staff }, { data: admins }, { count: classroomCount }] =
        await Promise.all([
          supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('status', 'active'),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .neq('role', 'superadmin'),
          supabase
            .from('profiles')
            .select('welcome_email_sent')
            .eq('school_id', school.id)
            .eq('role', 'admin')
            .eq('status', 'active')
            .limit(1),
          supabase
            .from('classrooms')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', school.id)
            .eq('status', 'active'),
        ])

      const monthlyPrice = getSchoolMonthlyPrice(school.settings)
      const students = activeStudents || 0
      const active = isSchoolBillingActive(school.settings)
      const commercial = getCommercialFromSettings(school.settings)
      const adminRow = admins?.[0]

      const onboarding = computeOnboardingSteps({
        hasAdmin: (admins?.length || 0) > 0,
        adminWelcomeSent: !!adminRow?.welcome_email_sent,
        classroomsCount: classroomCount || 0,
        studentsCount: students,
        guardiansCount: 0,
        guardiansWithAccess: 0,
        monthlyPrice,
        hasContractDoc: false,
        commercial,
      })

      return {
        ...school,
        activeStudents: students,
        staff: staff || 0,
        monthlyPrice,
        mrr: getSchoolMrr(school.settings),
        effectivePerStudent: getEffectivePricePerStudent(monthlyPrice, students),
        billingActive: active,
        onboarding,
      }
    })
  )

  const totalMrr = schoolStats.reduce((sum, s) => sum + s.mrr, 0)
  const activeSchools = schoolStats.filter((s) => s.billingActive && !isDemoSchool(s.settings, s.id)).length
  const notReady = schoolStats.filter((s) => !s.onboarding.ready && !isDemoSchool(s.settings, s.id))
  const demoSchool = schoolStats.find((s) => isDemoSchool(s.settings, s.id))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Panoràmica</h2>
        <p className="text-stone-500 text-sm mt-1">Finances, onboarding i alertes operatives.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="MRR total" value={`${totalMrr} €`} />
        <Kpi label="Centres actius" value={`${activeSchools} / ${schoolsCount || 0}`} />
        <Kpi label="Alumnes actius" value={String(studentsCount || 0)} />
        <Kpi label="Personal" value={String(teachersCount || 0)} />
        <Kpi label="Alertes crítiques" value={String(criticalCount)} highlight={criticalCount > 0} />
      </div>

      {demoSchool && (
        <SaPanel>
          <SaPanelHeader
            title="Centre DEMO"
            action={
              <Link
                href={`/superadmin/escoles/${demoSchool.id}`}
                className="text-xs font-bold text-violet-400 hover:text-violet-300"
              >
                Gestionar →
              </Link>
            }
          />
          <div className="p-4 text-sm text-stone-300 space-y-2">
            <p>
              <span className="font-bold text-amber-300">{demoSchool.name}</span> — dades fictícies per presentacions.
              Correus <code className="text-stone-400">@escola-demo.invalid</code> (no s&apos;envien).
            </p>
            <p className="text-xs font-mono text-stone-400">
              Directora: {DEMO_SCHOOL_META.directorEmail} · Contrasenya: {DEMO_SCHOOL_META.defaultPassword}
            </p>
          </div>
        </SaPanel>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <SaPanel>
          <SaPanelHeader
            title="Alertes (resum)"
            action={
              <Link href="/superadmin/alertes" className="text-xs font-bold text-violet-400 hover:text-violet-300">
                Veure totes →
              </Link>
            }
          />
          <div className="p-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-stone-500">Cap alerta. Tot en ordre.</p>
            ) : (
              <SuperadminAlertsClient alerts={alerts.slice(0, 5)} />
            )}
          </div>
        </SaPanel>

        <SaPanel>
          <SaPanelHeader
            title="Onboarding pendent"
            action={
              <Link href="/superadmin/escoles" className="text-xs font-bold text-violet-400 hover:text-violet-300">
                Escoles →
              </Link>
            }
          />
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {notReady.length === 0 ? (
              <p className="text-sm text-stone-500">Tots els centres operatius.</p>
            ) : (
              notReady.slice(0, 4).map((s) => (
                <div key={s.id} className="border-b border-stone-800 pb-3 last:border-0">
                  <OnboardingPanel
                    schoolId={s.id}
                    schoolName={s.name}
                    steps={s.onboarding.steps}
                    progress={s.onboarding.progress}
                    ready={s.onboarding.ready}
                    compact
                  />
                </div>
              ))
            )}
          </div>
        </SaPanel>
      </div>

      <SaPanel>
        <SaPanelHeader
          title="Detall per escola"
          action={
            <div className="flex gap-3">
              <Link href="/superadmin/finances" className="text-xs font-bold text-violet-400 hover:text-violet-300">
                Finances ERP →
              </Link>
              <Link href="/superadmin/escoles" className="text-xs font-bold text-violet-400 hover:text-violet-300">
                Gestionar escoles →
              </Link>
            </div>
          }
        />
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Escola</th>
              <th className="px-4 py-2 font-bold">Onboarding</th>
              <th className="px-4 py-2 font-bold">Alumnes</th>
              <th className="px-4 py-2 font-bold">Quota/mes</th>
              <th className="px-4 py-2 font-bold">MRR</th>
              <th className="px-4 py-2 font-bold text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60">
            {schoolStats.map((school) => (
              <tr key={school.id} className="hover:bg-stone-800/30">
                <td className="px-4 py-3">
                  <div className="font-bold text-stone-200 text-sm">{school.name}</div>
                  <div className="text-[11px] text-stone-500">{school.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold ${school.onboarding.ready ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {school.onboarding.progress}%
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-300">{school.activeStudents}</td>
                <td className="px-4 py-3 text-stone-300">
                  {school.billingActive ? `${school.monthlyPrice} €` : '—'}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-400">
                  {school.billingActive ? `${school.mrr} €` : '0 €'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/superadmin/escoles/${school.id}`}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300"
                  >
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
            {schoolStats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500 text-sm">
                  Cap escola registrada.{' '}
                  <Link href="/superadmin/escoles" className="text-violet-400 hover:underline">
                    Crear la primera
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>

      <p className="text-[11px] text-stone-600">
        MRR = suma de quotes mensuals dels centres actius. Contractes, NDA i factures a{' '}
        <Link href="/superadmin/finances" className="text-violet-500 hover:underline">
          Finances
        </Link>{' '}
        i pestanya Comercial de cada escola.
      </p>
    </div>
  )
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4">
      <div className="text-[11px] uppercase font-bold text-stone-500">{label}</div>
      <div className={`text-2xl font-black mt-1 ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  )
}
