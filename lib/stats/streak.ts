import { createClient } from '@/lib/supabase/server'

/**
 * Calculate current streak for a user
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let checkDate = new Date(today)

  // Check today first
  const todayStr = checkDate.toISOString().split('T')[0]
  const { data: todayStats } = await supabase
    .from('daily_stats')
    .select('reviews_completed')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .single()

  // If no activity today, check yesterday
  if (!todayStats || todayStats.reviews_completed === 0) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Count consecutive days with activity
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_stats')
      .select('reviews_completed')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single()

    if (data && data.reviews_completed > 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

