import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for normal application operations (API routes,
 * server actions). Uses the same public URL + anon key as the browser client
 * — NOT the service-role key — so every query stays subject to Row Level
 * Security. This module is still kept server-only (via "server-only") purely
 * so server code doesn't accidentally diverge from this pattern, not because
 * the key itself is secret.
 *
 * There is intentionally no service-role/admin client in this codebase yet.
 * Add one only when a genuinely privileged operation requires bypassing RLS
 * (e.g. a trusted backend job), and keep it isolated from request-scoped code.
 */
import "server-only";

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
