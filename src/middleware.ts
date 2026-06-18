import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass Next.js internals and static files unconditionally
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Securely initialize Supabase server client to parse the real session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Actively check the JWT validity and refresh it if necessary
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If user is authenticated and trying to access login/register, kick them to dashboard
  if (user && isPublic && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT authenticated and trying to access a protected route, kick them to login
  if (!user && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Root route redirection
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};