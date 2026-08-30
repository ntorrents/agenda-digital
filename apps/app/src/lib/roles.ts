/** Roles del personal amb accés al panell /dashboard */
export const DASHBOARD_STAFF_ROLES = ['admin', 'teacher', 'auxiliary'] as const
export type DashboardStaffRole = (typeof DASHBOARD_STAFF_ROLES)[number]

export function isDashboardStaff(role: string | null | undefined): role is DashboardStaffRole {
  return !!role && (DASHBOARD_STAFF_ROLES as readonly string[]).includes(role)
}

export function firstName(fullName: string | null | undefined): string {
  const trimmed = (fullName || '').trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] || trimmed
}
