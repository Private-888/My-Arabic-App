import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // Get session from cookies (Supabase stores it in sb-<project-ref>-auth-token)
  const sessionCookie = cookieStore.getAll().find(
    cookie => cookie.name.includes('auth-token')
  )

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  // If we have a session cookie, set it
  if (sessionCookie?.value) {
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session) {
        // Try to set session from cookie
        await client.auth.setSession({
          access_token: sessionCookie.value,
          refresh_token: '',
        } as any)
      }
    } catch {
      // Ignore errors
    }
  }

  return client
}

