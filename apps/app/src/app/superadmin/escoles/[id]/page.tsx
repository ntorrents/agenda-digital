import { Suspense } from 'react'
import { getSuperadminDb } from '@/lib/superadmin'
import { notFound } from 'next/navigation'
import { SchoolManageClient } from '@/components/superadmin/SchoolManageClient'
import { getCommercialFromSettings, isErpTableMissing, type BillingEvent, type SchoolDocument, type SchoolInvoice } from '@/lib/superadmin-commercial'
import { computeOnboardingSteps } from '@/lib/superadmin-onboarding'
import { getSchoolMonthlyPrice } from '@/lib/superadmin-billing'

type GuardianSummary = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  relation: string
  welcome_email_sent: boolean
}

export default async function SuperadminSchoolDetail(props: { params: Promise<{ id: string }> }) {
  const { id: schoolId } = await props.params
  const supabase = await getSuperadminDb()

  const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single()
  if (!school) notFound()

  const [
    { data: classrooms },
    { data: staff },
    { data: students },
    { count: activeStudents },
    { count: guardiansCount },
    { data: documentsRaw, error: docError },
    { data: invoicesRaw, error: invError },
    { data: billingEventsRaw, error: billError },
  ] = await Promise.all([
    supabase
      .from('classrooms')
      .select('id, name, level, capacity, teacher_id, status')
      .eq('school_id', schoolId)
      .order('name'),
    supabase
      .from('profiles')
      .select('id, full_name, email, role, phone, status, welcome_email_sent')
      .eq('school_id', schoolId)
      .in('role', ['admin', 'teacher', 'auxiliary'])
      .order('full_name'),
    supabase
      .from('students')
      .select('id, first_name, last_name, date_of_birth, classroom_id, status')
      .eq('school_id', schoolId)
      .order('first_name'),
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('role', 'guardian'),
    supabase
      .from('school_documents')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false }),
    supabase
      .from('school_invoices')
      .select('*')
      .eq('school_id', schoolId)
      .order('period_start', { ascending: false }),
    supabase
      .from('school_billing_events')
      .select('*')
      .eq('school_id', schoolId)
      .order('effective_from', { ascending: false }),
  ])

  const erpTablesMissing =
    isErpTableMissing(docError) || isErpTableMissing(invError) || isErpTableMissing(billError)

  const documents = (documentsRaw || []) as SchoolDocument[]
  const invoices = (invoicesRaw || []) as SchoolInvoice[]
  const billingEvents = (billingEventsRaw || []) as BillingEvent[]

  const studentIds = (students || []).map((s) => s.id)
  const guardiansByStudent: Record<string, GuardianSummary[]> = {}
  let guardiansWithAccess = 0

  if (studentIds.length > 0) {
    const { data: guardianRows } = await supabase
      .from('student_guardians')
      .select('student_id, relation, guardian_id')
      .in('student_id', studentIds)

    const guardianIds = [...new Set((guardianRows || []).map((r) => r.guardian_id))]
    const { data: guardianProfiles } = guardianIds.length
      ? await supabase
          .from('profiles')
          .select('id, full_name, email, phone, welcome_email_sent')
          .in('id', guardianIds)
      : {
          data: [] as {
            id: string
            full_name: string | null
            email: string | null
            phone: string | null
            welcome_email_sent: boolean | null
          }[],
        }

    const profileById = new Map((guardianProfiles || []).map((p) => [p.id, p]))

    for (const row of guardianRows || []) {
      const p = profileById.get(row.guardian_id)
      if (!guardiansByStudent[row.student_id]) guardiansByStudent[row.student_id] = []
      guardiansByStudent[row.student_id].push({
        id: row.guardian_id,
        full_name: p?.full_name ?? null,
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        relation: row.relation,
        welcome_email_sent: !!p?.welcome_email_sent,
      })
    }

    guardiansWithAccess = (guardianProfiles || []).filter((p) => p.welcome_email_sent).length
  }

  const studentsWithGuardians = (students || []).map((s) => ({
    ...s,
    guardians: guardiansByStudent[s.id] || [],
  }))

  const adminMember = (staff || []).find((s) => s.role === 'admin' && s.status === 'active')
  const commercial = getCommercialFromSettings(school.settings)
  const hasContractDoc = documents.some((d) => d.doc_type === 'contract')

  const onboarding = computeOnboardingSteps({
    hasAdmin: !!adminMember,
    adminWelcomeSent: !!adminMember?.welcome_email_sent,
    classroomsCount: classrooms?.filter((c) => c.status === 'active').length || 0,
    studentsCount: activeStudents || 0,
    guardiansCount: guardiansCount || 0,
    guardiansWithAccess,
    monthlyPrice: getSchoolMonthlyPrice(school.settings),
    hasContractDoc,
    commercial,
  })

  return (
    <Suspense fallback={<div className="text-stone-500 text-sm">Carregant centre…</div>}>
      <SchoolManageClient
      school={school}
      classrooms={classrooms || []}
      staff={staff || []}
      students={studentsWithGuardians}
      stats={{
        activeStudents: activeStudents || 0,
        staffCount: staff?.filter((s) => s.status === 'active').length || 0,
        classroomsCount: classrooms?.filter((c) => c.status === 'active').length || 0,
      }}
      commercial={commercial}
      documents={documents}
      invoices={invoices}
      billingEvents={billingEvents}
      erpTablesMissing={erpTablesMissing}
      onboarding={onboarding}
      />
    </Suspense>
  )
}
