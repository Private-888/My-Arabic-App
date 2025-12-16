import { createClient } from '@supabase/supabase-js'

/**
 * Admin client for server-side operations that require elevated privileges.
 * Use sparingly and only in server actions/API routes.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

