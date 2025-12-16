'use server'

import { createClient } from '@/lib/supabase/server'
import { processReview, calculateXP, createInitialReview } from '@/lib/srs/engine'
import type { Rating } from '@/lib/srs/types'

export async function submitReview(
  reviewId: string,
  rating: Rating
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, words(*)')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single()

    if (reviewError || !review) {
      return { success: false, error: 'Review not found' }
    }

    // Process review with SRS algorithm
    const update = processReview(review as any, rating)
    const isNewWord = review.state === 'new'
    const xpEarned = calculateXP(rating, isNewWord)

    // Update review
    const { error: updateError } = await supabase
      .from('reviews')
      .update(update)
      .eq('id', reviewId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0]
    
    // Get or create today's stats
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existingStats) {
      await supabase
        .from('daily_stats')
        .update({
          reviews_completed: existingStats.reviews_completed + 1,
          new_words_learned: isNewWord
            ? existingStats.new_words_learned + 1
            : existingStats.new_words_learned,
          xp_earned: existingStats.xp_earned + xpEarned,
        })
        .eq('id', existingStats.id)
    } else {
      await supabase.from('daily_stats').insert({
        user_id: user.id,
        date: today,
        reviews_completed: 1,
        new_words_learned: isNewWord ? 1 : 0,
        xp_earned: xpEarned,
        streak: await calculateStreak(user.id),
      })
    }

    // Update profile XP and level
    await updateProfileXP(user.id, xpEarned)

    return { success: true }
  } catch (error) {
    console.error('Error submitting review:', error)
    return { success: false, error: 'Failed to submit review' }
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let checkDate = new Date(today)

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

async function updateProfileXP(userId: string, xpEarned: number): Promise<void> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('user_id', userId)
    .single()

  if (profile) {
    const newXP = profile.xp + xpEarned
    const newLevel = Math.floor(newXP / 100) + 1

    await supabase
      .from('profiles')
      .update({
        xp: newXP,
        level: newLevel,
      })
      .eq('user_id', userId)
  } else {
    // Create profile if it doesn't exist
    await supabase.from('profiles').insert({
      user_id: userId,
      xp: xpEarned,
      level: 1,
      dialect: 'Palestinian',
      daily_goal: 20,
    })
  }
}

