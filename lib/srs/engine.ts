import type { Rating, Review, ReviewState, ReviewUpdate } from './types'

/**
 * SM-2-lite spaced repetition algorithm
 * Simplified version of SuperMemo 2 algorithm
 */

const MIN_EASE = 1.3
const MAX_EASE = 2.5
const INITIAL_EASE = 2.5
const INITIAL_INTERVAL = 1 // days

/**
 * Calculate new review state based on current state and rating
 */
function getNewState(currentState: ReviewState, rating: Rating): ReviewState {
  if (rating === 'again') {
    return 'new'
  }

  if (currentState === 'new') {
    if (rating === 'hard' || rating === 'good') {
      return 'learning'
    }
    if (rating === 'easy') {
      return 'review'
    }
  }

  if (currentState === 'learning') {
    if (rating === 'good' || rating === 'easy') {
      return 'review'
    }
  }

  if (currentState === 'review') {
    if (rating === 'easy' && currentState === 'review') {
      return 'known'
    }
  }

  return currentState
}

/**
 * Calculate ease factor adjustment based on rating
 */
function calculateEaseFactor(
  currentEase: number,
  rating: Rating
): number {
  let newEase = currentEase

  switch (rating) {
    case 'again':
      newEase = Math.max(MIN_EASE, currentEase - 0.2)
      break
    case 'hard':
      newEase = Math.max(MIN_EASE, currentEase - 0.15)
      break
    case 'good':
      // No change for 'good' - maintains current ease
      break
    case 'easy':
      newEase = Math.min(MAX_EASE, currentEase + 0.15)
      break
  }

  return Math.round(newEase * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate new interval based on current interval, ease factor, and rating
 */
function calculateInterval(
  currentInterval: number,
  easeFactor: number,
  rating: Rating,
  repetitionCount: number
): number {
  if (rating === 'again') {
    return INITIAL_INTERVAL
  }

  if (rating === 'hard') {
    return Math.max(1, Math.floor(currentInterval * 0.8))
  }

  if (rating === 'good') {
    if (repetitionCount === 0) {
      return INITIAL_INTERVAL
    }
    if (repetitionCount === 1) {
      return 2
    }
    return Math.floor(currentInterval * easeFactor)
  }

  if (rating === 'easy') {
    if (repetitionCount === 0) {
      return 2
    }
    return Math.floor(currentInterval * easeFactor * 1.3)
  }

  return currentInterval
}

/**
 * Process a review rating and return updated review data
 */
export function processReview(
  review: Review,
  rating: Rating
): ReviewUpdate {
  const now = new Date().toISOString()
  const currentState = review.state
  const newState = getNewState(currentState, rating)
  
  const newEaseFactor = calculateEaseFactor(review.ease_factor, rating)
  
  const newRepetitionCount =
    rating === 'again' ? 0 : review.repetition_count + 1
  
  const newLapseCount =
    rating === 'again' ? review.lapse_count + 1 : review.lapse_count
  
  const newInterval = calculateInterval(
    review.interval_days,
    newEaseFactor,
    rating,
    review.repetition_count
  )

  // Calculate due date
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + newInterval)
  const dueDateISO = dueDate.toISOString()

  return {
    state: newState,
    due_date: dueDateISO,
    interval_days: newInterval,
    ease_factor: newEaseFactor,
    repetition_count: newRepetitionCount,
    lapse_count: newLapseCount,
    last_reviewed_at: now,
  }
}

/**
 * Create initial review data for a new word
 */
export function createInitialReview(wordId: string, userId: string): Omit<Review, 'id' | 'created_at' | 'updated_at'> {
  const now = new Date().toISOString()
  const dueDate = new Date().toISOString()

  return {
    user_id: userId,
    word_id: wordId,
    state: 'new',
    due_date: dueDate,
    interval_days: 0,
    ease_factor: INITIAL_EASE,
    repetition_count: 0,
    lapse_count: 0,
    last_reviewed_at: null,
  }
}

/**
 * Calculate XP earned for a review rating
 */
export function calculateXP(rating: Rating, isNewWord: boolean): number {
  const baseXP = {
    again: 1,
    hard: 3,
    good: 5,
    easy: 7,
  }[rating]

  return isNewWord ? baseXP + 2 : baseXP
}

