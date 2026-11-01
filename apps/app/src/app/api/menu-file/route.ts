import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAllowedMenuFileUrl } from '@/lib/menu-file-url'

/**
 * Sirve el fichero del menú desde same-origin para poder embeber PDF/imagen
 * (Supabase Storage a menudo envía cabeceras que bloquean iframe).
 * Solo usuarios autenticados; URL debe ser del proyecto / PRE local.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fileUrl = new URL(request.url).searchParams.get('url')
  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseBase) {
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  if (!isAllowedMenuFileUrl(fileUrl, supabaseBase)) {
    return NextResponse.json(
      { error: 'Forbidden host', detail: 'URL de menú no permitida para proxy' },
      { status: 403 }
    )
  }

  // Intentar URL tal cual; si falla en PRE, probar localhost ↔ 127.0.0.1
  const candidates = [fileUrl]
  try {
    const u = new URL(fileUrl)
    if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1'
      candidates.push(u.toString())
    } else if (u.hostname === '127.0.0.1') {
      u.hostname = 'localhost'
      candidates.push(u.toString())
    }
  } catch {
    // ignore
  }

  let upstream: Response | null = null
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { cache: 'no-store' })
      if (res.ok && res.body) {
        upstream = res
        break
      }
    } catch {
      // probar siguiente candidato
    }
  }

  if (!upstream?.body) {
    return NextResponse.json({ error: 'Upstream failed' }, { status: 502 })
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'private, max-age=300')
  headers.set('Content-Disposition', 'inline')

  return new NextResponse(upstream.body, { status: 200, headers })
}
