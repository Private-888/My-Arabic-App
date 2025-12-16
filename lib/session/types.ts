export interface Word {
  id: string
  user_id: string
  category: string
  term: string
  arabic: string
  transliteration: string | null
  meaning: string
  notes: string | null
  dialect: string
  created_at: string
  updated_at: string
}

export interface ReviewWithWord {
  review: {
    id: string
    user_id: string
    word_id: string
    state: string
    due_date: string
    interval_days: number
    ease_factor: number
    repetition_count: number
    lapse_count: number
    last_reviewed_at: string | null
    created_at: string
    updated_at: string
  }
  word: Word
}

export type SessionMode = 'daily' | 'free' | 'random' | 'bookmarked' | 'course' | 'scenario'

export interface SessionConfig {
  mode: SessionMode
  limit?: number
  category?: string
  courseId?: string
  scenarioId?: string
}

