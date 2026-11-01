/** Hosts típicos de PRE local (Docker / Supabase CLI). */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]'])

/**
 * ¿Podemos hacer proxy de esta URL de menú?
 * Acepta el host de NEXT_PUBLIC_SUPABASE_URL y, en PRE, cualquier
 * localhost/127.0.0.1 (a menudo Studio :8000 vs API :54321).
 */
export function isAllowedMenuFileUrl(fileUrl: string, supabaseBase: string): boolean {
  let parsed: URL
  let base: URL
  try {
    parsed = new URL(fileUrl)
    base = new URL(supabaseBase)
  } catch {
    return false
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false
  }

  if (parsed.host === base.host) return true

  // PRE: localhost ↔ 127.0.0.1 y puertos distintos (8000 / 54321 / …)
  if (LOCAL_HOSTS.has(parsed.hostname) && LOCAL_HOSTS.has(base.hostname)) {
    return true
  }

  // URL pública de storage del mismo proyecto (path característico)
  if (
    parsed.pathname.includes('/storage/v1/object/') &&
    (parsed.host === base.host || LOCAL_HOSTS.has(parsed.hostname))
  ) {
    return true
  }

  return false
}

export function isPdfUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase()
    return path.endsWith('.pdf')
  } catch {
    return /\.pdf($|\?)/i.test(url)
  }
}
