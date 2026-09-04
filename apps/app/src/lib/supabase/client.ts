import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Cliente para Client Components (navegador).
 * `createBrowserClient` ya es singleton interno: llamar N veces = 1 instancia.
 * Acceso vía HTTP/PostgREST (no pool Postgres).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
