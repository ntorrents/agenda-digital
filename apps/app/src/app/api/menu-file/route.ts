import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Sirve el fichero del menú desde same-origin para poder embeber PDF
 * (Supabase Storage a menudo envía cabeceras que bloquean iframe).
 * Solo usuarios autenticados; URL debe ser del proyecto Supabase configurado.
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

  let parsed: URL
  try {
    parsed = new URL(fileUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseBase) {
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  let allowedHost: string
  try {
    allowedHost = new URL(supabaseBase).host
  } catch {
    return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  }

  if (parsed.host !== allowedHost) {
    return NextResponse.json({ error: 'Forbidden host' }, { status: 403 })
  }

  const upstream = await fetch(fileUrl, {
    // Cache corto en edge/node según runtime
    next: { revalidate: 3600 },
  })

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Upstream failed' }, { status: 502 })
  }

  const contentType = upstream.headers.get('content-type') || 'application/pdf'
  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'private, max-age=3600')
  // Permitir embeber en la propia app
  headers.set('Content-Disposition', 'inline')

  return new NextResponse(upstream.body, { status: 200, headers })
}
