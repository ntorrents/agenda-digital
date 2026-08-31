export const DEFAULT_MONTHLY_PRICE = 80
export const DEFAULT_STAFF_PASSWORD = 'agenda-digital-pwd'

export function slugifySchoolName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
