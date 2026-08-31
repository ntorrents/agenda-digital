import { getCommercialFromSettings } from '@/lib/superadmin-commercial'
import { getSchoolMonthlyPrice, isSchoolBillingActive } from '@/lib/superadmin-billing'
import { buildOperationalAlerts } from '@/lib/superadmin-onboarding'
import { getSuperadminDb } from '@/lib/superadmin'

export async function fetchOperationalHealth() {
  const admin = await getSuperadminDb()

  const { data: schools } = await admin.from('schools').select('id, name, settings, created_at').order('name')

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const in60 = new Date()
  in60.setDate(in60.getDate() + 60)
  const in60Str = in60.toISOString().slice(0, 10)

  const enriched = await Promise.all(
    (schools || []).map(async (school) => {
      const commercial = getCommercialFromSettings(school.settings)

      const [
        { count: activeStudents },
        { count: staffCount },
        { data: admins },
        { count: guardiansTotal },
        { count: guardiansNoAccess },
        { count: overdueInvoices },
        { count: pendingInvoices },
        { count: recentLogs },
      ] = await Promise.all([
        admin
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'active'),
        admin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .in('role', ['admin', 'teacher', 'auxiliary'])
          .eq('status', 'active'),
        admin
          .from('profiles')
          .select('welcome_email_sent')
          .eq('school_id', school.id)
          .eq('role', 'admin')
          .eq('status', 'active')
          .limit(1),
        admin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('role', 'guardian'),
        admin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('role', 'guardian')
          .eq('welcome_email_sent', false),
        admin
          .from('school_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'overdue'),
        admin
          .from('school_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .in('status', ['pending', 'sent']),
        admin
          .from('daily_logs')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .gte('date', weekAgoStr),
      ])

      const adminRow = admins?.[0]
      const contractEnd = commercial.contract_end

      return {
        id: school.id,
        name: school.name,
        settings: school.settings,
        activeStudents: activeStudents || 0,
        staffCount: staffCount || 0,
        hasAdmin: (admins?.length || 0) > 0,
        adminWelcomeSent: !!adminRow?.welcome_email_sent,
        overdueInvoices: overdueInvoices || 0,
        pendingInvoices: pendingInvoices || 0,
        contractExpiringSoon: !!(contractEnd && contractEnd >= today && contractEnd <= in60Str),
        contractExpired: !!(contractEnd && contractEnd < today),
        guardiansWithoutAccess: guardiansNoAccess || 0,
        recentAgendaDays: recentLogs || 0,
        monthlyPrice: getSchoolMonthlyPrice(school.settings),
        billingActive: isSchoolBillingActive(school.settings),
        commercial,
        guardiansCount: guardiansTotal || 0,
      }
    })
  )

  const alerts = buildOperationalAlerts(enriched)

  return { schools: enriched, alerts }
}
