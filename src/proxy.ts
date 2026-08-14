import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Login না থাকলে dashboard এ যেতে দেবে না
  if (
    pathname.startsWith('/dashboard') &&
    !user
  ) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Login/Register এ থাকলে role-redirect page এ পাঠাও
  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/auth/redirect', request.url))
  }

  // Login হলে session start করো
  if (user && pathname === '/auth/redirect') {
    const sessionCheckUrl = new URL('/api/session/start', request.url)
    fetch(sessionCheckUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        device_info: request.headers.get('user-agent') || 'unknown',
      }),
    }).catch(() => { })  // fire-and-forget, error হলেও block করবে না
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}