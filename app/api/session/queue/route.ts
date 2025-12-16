import { createClient } from '@/lib/supabase/server'
import { buildDailyQueue } from '@/lib/session/buildDailyQueue'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const queue = await buildDailyQueue(user.id, 20)

    return NextResponse.json({ queue })
  } catch (error) {
    console.error('Error building session queue:', error)
    return NextResponse.json(
      { error: 'Failed to build session queue' },
      { status: 500 }
    )
  }
}

