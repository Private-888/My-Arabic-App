export type ReviewState = 'new' | 'learning' | 'review' | 'known'

export type Rating = 'again' | 'hard' | 'good' | 'easy'

export interface Review {
  id: string
  user_id: string
  word_id: string
  state: ReviewState
  due_date: string
  interval_days: number
  ease_factor: number
  repetition_count: number
  lapse_count: number
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewUpdate {
  state: ReviewState
  due_date: string
  interval_days: number
  ease_factor: number
  repetition_count: number
  lapse_count: number
  last_reviewed_at: string
}

