import type { CommercialSettings } from '@/lib/superadmin-commercial'

export type OnboardingStep = {
  id: string
  label: string
  done: boolean
  detail?: string
}

export function computeOnboardingSteps(input: {
  hasAdmin: boolean
  adminWelcomeSent: boolean
  classroomsCount: number
  studentsCount: number
  guardiansCount: number
  guardiansWithAccess: number
  monthlyPrice: number
  hasContractDoc: boolean
  commercial: CommercialSettings
}): { steps: OnboardingStep[]; progress: number; ready: boolean } {
  const steps: OnboardingStep[] = [
    {
      id: 'director',
      label: 'Directora/admin donada d\'alta',
      done: input.hasAdmin,
      detail: input.hasAdmin ? (input.adminWelcomeSent ? 'Accés enviat' : 'Falta enviar accés') : 'Crear rol admin',
    },
    {
      id: 'access',
      label: 'Accés de direcció enviat',
      done: input.adminWelcomeSent,
    },
    {
      id: 'classrooms',
      label: 'Aules creades',
      done: input.classroomsCount > 0,
      detail: `${input.classroomsCount} aula(s)`,
    },
    {
      id: 'students',
      label: 'Alumnes actius',
      done: input.studentsCount > 0,
      detail: `${input.studentsCount} alumne(s)`,
    },
    {
      id: 'guardians',
      label: 'Famílies amb tutor registrat',
      done: input.guardiansCount > 0,
      detail: `${input.guardiansCount} tutor(s)`,
    },
    {
      id: 'commercial',
      label: 'Quota mensual configurada',
      done: input.monthlyPrice > 0,
      detail: input.monthlyPrice > 0 ? `${input.monthlyPrice} €/mes` : undefined,
    },
    {
      id: 'contract',
      label: 'Contracte pujat',
      done: input.hasContractDoc,
    },
    {
      id: 'contract_dates',
      label: 'Dates de contracte informades',
      done: !!(input.commercial.contract_start && input.commercial.contract_end),
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const ready = steps.filter((s) => ['director', 'access', 'classrooms', 'students', 'commercial'].includes(s.id)).every(
    (s) => s.done
  )

  return { steps, progress, ready }
}

export type OperationalAlert = {
  id: string
  schoolId: string
  schoolName: string
  severity: 'warning' | 'critical' | 'info'
  title: string
  detail: string
}

export function buildOperationalAlerts(
  schools: {
    id: string
    name: string
    settings: unknown
    activeStudents: number
    staffCount: number
    adminWelcomeSent: boolean
    hasAdmin: boolean
    overdueInvoices: number
    pendingInvoices: number
    contractExpiringSoon: boolean
    contractExpired: boolean
    guardiansWithoutAccess: number
    recentAgendaDays: number
  }[]
): OperationalAlert[] {
  const alerts: OperationalAlert[] = []

  for (const s of schools) {
    if (!s.hasAdmin) {
      alerts.push({
        id: `${s.id}-no-admin`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'critical',
        title: 'Sense directora/admin',
        detail: 'No hi ha cap usuari amb rol admin actiu.',
      })
    } else if (!s.adminWelcomeSent) {
      alerts.push({
        id: `${s.id}-no-access`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'warning',
        title: 'Directora sense accés enviat',
        detail: 'Encara no s\'ha enviat el correu d\'accés.',
      })
    }

    if (s.activeStudents === 0 && s.staffCount > 0) {
      alerts.push({
        id: `${s.id}-no-students`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'warning',
        title: 'Centre sense alumnes actius',
        detail: 'Hi ha personal però 0 alumnes.',
      })
    }

    if (s.recentAgendaDays === 0 && s.activeStudents > 0) {
      alerts.push({
        id: `${s.id}-no-agenda`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'info',
        title: 'Sense agendes recentes (7 dies)',
        detail: 'Cap registre d\'agenda la darrera setmana.',
      })
    }

    if (s.guardiansWithoutAccess > 0) {
      alerts.push({
        id: `${s.id}-guardians-access`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'info',
        title: `${s.guardiansWithoutAccess} família(s) sense accés enviat`,
        detail: 'Tutors sense welcome_email_sent.',
      })
    }

    if (s.overdueInvoices > 0) {
      alerts.push({
        id: `${s.id}-overdue`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'critical',
        title: `${s.overdueInvoices} factura(s) vençuda(es)`,
        detail: 'Revisa el mòdul de finances.',
      })
    }

    if (s.contractExpired) {
      alerts.push({
        id: `${s.id}-contract-expired`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'critical',
        title: 'Contracte vençut',
        detail: 'La data de fi de contracte ja ha passat.',
      })
    } else if (s.contractExpiringSoon) {
      alerts.push({
        id: `${s.id}-contract-soon`,
        schoolId: s.id,
        schoolName: s.name,
        severity: 'warning',
        title: 'Contracte proper a vèncer',
        detail: 'Renovació en menys de 60 dies.',
      })
    }
  }

  const order = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => order[a.severity] - order[b.severity])
}
