'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Generates a short-lived signed URL for a file in the private
 * 'vivasayi-storage' bucket. Call this server-side, right before you
 * need to display or link to a user's soil report — do not store the
 * result, it expires.
 *
 * Auth note: this uses the caller's own session (via cookies), so RLS
 * storage policies still apply — a user can only get a signed URL for
 * their own files if your bucket policies are scoped to auth.uid().
 * See migrations.sql for the matching storage policy.
 */
export async function getSignedFileUrl(
  filePath: string,
  expiresInSeconds: number = 60 * 10 // 10 minutes
): Promise<string | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: this is a read-only action, not a route/middleware
          // context, so we don't need to persist refreshed cookies here.
        },
      },
    }
  );

  const { data, error } = await supabase.storage
    .from('vivasayi-storage')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    console.error('Failed to create signed URL:', error.message);
    return null;
  }

  return data.signedUrl;
}
