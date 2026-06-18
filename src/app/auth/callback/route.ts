import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Handles the redirect from Supabase OAuth providers (e.g. Google).
// Exchanges the temporary `code` query param for a real session and
// sets the session cookies before sending the user to the dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectedFrom = searchParams.get('redirectedFrom') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectedFrom}`);
    }

    console.error('OAuth callback error:', error.message);
  }

  // No code or exchange failed — send the user back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
