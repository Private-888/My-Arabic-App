import { createClient } from '@/lib/supabase/server'
import type { ReviewWithWord } from './types'

const MAX_NEW_WORDS = 5
const MAX_BOSS_FIGHT = 3
const MAX_DUE_REVIEWS = 20

/**
 * Build daily session queue with priority:
 * 1. Due reviews (highest priority)
 * 2. New words (limited)
 * 3. Boss fight (hardest cards based on lapses/ease)
 */
export async function buildDailyQueue(
  userId: string,
  limit: number = 20
): Promise<ReviewWithWord[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const queue: ReviewWithWord[] = []

  // 1. Get due reviews (excluding 'known' state)
  const { data: dueReviews, error: dueError } = await supabase
    .from('reviews')
    .select(`
      *,
      words (*)
    `)
    .eq('user_id', userId)
    .lte('due_date', now)
    .neq('state', 'known')
    .order('due_date', { ascending: true })
    .limit(MAX_DUE_REVIEWS)

  if (dueError) {
    console.error('Error fetching due reviews:', dueError)
  } else if (dueReviews) {
    for (const review of dueReviews) {
      if (queue.length >= limit) break
      queue.push({
        review: review as any,
        word: review.words as any,
      })
    }
  }

  // 2. Get new words if we have space
  if (queue.length < limit) {
    const { data: newWords, error: newError } = await supabase
      .from('reviews')
      .select(`
        *,
        words (*)
      `)
      .eq('user_id', userId)
      .eq('state', 'new')
      .order('created_at', { ascending: true })
      .limit(MAX_NEW_WORDS)

    if (newError) {
      console.error('Error fetching new words:', newError)
    } else if (newWords) {
      for (const review of newWords) {
        if (queue.length >= limit) break
        // Avoid duplicates
        if (!queue.some((q) => q.review.word_id === review.word_id)) {
          queue.push({
            review: review as any,
            word: review.words as any,
          })
        }
      }
    }
  }

  // 3. Get boss fight (hardest cards) if we still have space
  if (queue.length < limit) {
    const { data: bossFight, error: bossError } = await supabase
      .from('reviews')
      .select(`
        *,
        words (*)
      `)
      .eq('user_id', userId)
      .neq('state', 'known')
      .neq('state', 'new')
      .order('lapse_count', { ascending: false })
      .order('ease_factor', { ascending: true })
      .limit(MAX_BOSS_FIGHT)

    if (bossError) {
      console.error('Error fetching boss fight:', bossError)
    } else if (bossFight) {
      for (const review of bossFight) {
        if (queue.length >= limit) break
        // Avoid duplicates
        if (!queue.some((q) => q.review.word_id === review.word_id)) {
          queue.push({
            review: review as any,
            word: review.words as any,
          })
        }
      }
    }
  }

  return queue
}

