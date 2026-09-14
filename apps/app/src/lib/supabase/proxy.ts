import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/legal') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  )
}

function isRefreshTokenError(error: { code?: string; message?: string } | null) {
  if (!error) return false
  const code = error.code ?? ''
  const message = (error.message ?? '').toLowerCase()
  return (
    code === 'refresh_token_not_found' ||
    code === 'refresh_token_already_used' ||
    message.includes('refresh token') ||
    message.includes('invalid refresh token')
  )
}

/** Borra cookies de sesión Supabase (incl. chunks sb-*-auth-token.N). */
function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (!name.startsWith('sb-')) continue
    if (!name.includes('auth-token')) continue
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }
}

/** Copia cookies del response de Supabase al response final (redirect u otro). */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value)
  })
}

/**
 * Refresco de sesión en el proxy de Next.js (antes middleware).
 * Cliente por request con cookies del request/response — patrón oficial SSR.
 * Acceso vía HTTP/PostgREST (no pool Postgres).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Fitxers estàtics de /public i rutes d'icones — sense auth
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    /\.(?:svg|png|jpe?g|gif|webp|ico|woff2?|txt|xml|webmanifest)$/i.test(pathname)
  ) {
    return supabaseResponse
  }

  // Skip auth check if Supabase is not configured yet
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT use getSession() — it reads from storage
  // which could be tampered with. Always use getUser() for
  // server-side verification.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Refresh token muerto / rotado y no persistido → limpiar cookies o el
  // navegador reintenta el mismo token inválido en bucle.
  if (error && isRefreshTokenError(error)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = isPublicPath(pathname)
      ? NextResponse.next({ request })
      : NextResponse.redirect(url)
    copyCookies(supabaseResponse, response)
    clearSupabaseAuthCookies(request, response)
    return response
  }

  // Redirect unauthenticated users to login
  // (except for auth-related paths)
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    // CRÍTICO: devolver las cookies que setAll ya escribió (p. ej. clear session)
    copyCookies(supabaseResponse, redirectResponse)
    clearSupabaseAuthCookies(request, redirectResponse)
    return redirectResponse
  }

  return supabaseResponse
}
