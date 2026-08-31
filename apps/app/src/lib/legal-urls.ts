export const LEGAL_BASE = 'https://petitdiari.com/legal'

export function getLegalUrls(locale: string) {
  const isEs = locale === 'es'
  return {
    privacy: `${LEGAL_BASE}/${isEs ? 'privacidad' : 'privacitat'}`,
    terms: `${LEGAL_BASE}/${isEs ? 'terminos' : 'termes'}`,
    cookies: `${LEGAL_BASE}/cookies`,
    centres: `${LEGAL_BASE}/${isEs ? 'centros' : 'centres'}`,
  }
}
