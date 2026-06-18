import { createBrowserClient } from '@supabase/ssr';

/**
 * Single shared browser-side Supabase client.
 *
 * Previously every component called `createBrowserClient(...)` itself
 * (11 separate instantiations across the codebase). That's not wrong on
 * its own — createBrowserClient is cheap and the SDK is designed to be
 * called this way — but it meant any future config change (custom fetch,
 * custom headers, auth options) had to be copy-pasted into 11 files.
 * Import `supabase` from here instead.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
