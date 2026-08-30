export const APP_URL = 'https://app.petitdiari.com'

export function getWeb3FormsKey(): string {
  const key = import.meta.env.VITE_WEB3FORMS_KEY
  if (typeof key !== 'string') return ''
  const trimmed = key.trim()
  if (!trimmed || trimmed === 'your_access_key_here') return ''
  return trimmed
}
