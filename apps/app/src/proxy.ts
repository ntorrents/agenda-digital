// ============================================
// proxy.ts — Session refresh + auth guard
// (Replaces middleware.ts, deprecated in Next.js 16)
// ============================================

import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - manifest.webmanifest (PWA manifest)
     * - sw.js (service worker)
     * - icons/ (PWA icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|sw\\.js|icons/|.*\\.(?:svg|png|jpe?g|gif|webp|ico)$).*)',
  ],
}
