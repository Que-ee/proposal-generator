import { createClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client. Uses the public URL + anon key only — both
 * are safe to expose client-side and rely on Supabase row-level security for
 * access control.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    );
  }

  return createClient(url, anonKey);
}
