'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionCard } from '@/components/session/SessionCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { submitReview } from '@/lib/actions/reviews'
import { buildDailyQueue } from '@/lib/session/buildDailyQueue'
import type { ReviewWithWord } from '@/lib/session/types'
import type { Rating } from '@/lib/srs/types'
import { createClient } from '@/lib/supabase/browser'

export default function SessionPage() {
  const router = useRouter()
  const [queue, setQueue] = useState<ReviewWithWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSession() {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // For now, we'll need to create an API route or use a server action
      // Since buildDailyQueue is a server function, we'll create an API route
      const response = await fetch('/api/session/queue')
      if (!response.ok) {
        throw new Error('Failed to load session')
      }

      const data = await response.json()
      if (data.queue.length === 0) {
        setError('No words to review today!')
      } else {
        setQueue(data.queue)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  async function handleRate(rating: Rating) {
    if (submitting) return

    setSubmitting(true)
    const currentReview = queue[currentIndex]

    try {
      const result = await submitReview(currentReview.review.id, rating)

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }

      // Move to next card
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Session complete
        router.push('/session/complete')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </main>
    )
  }

  if (error && queue.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={error}
            onRetry={loadSession}
            className="mb-6"
          />
          <Button variant="accent" fullWidth onClick={() => router.push('/home')}>
            Go Home
          </Button>
        </div>
      </main>
    )
  }

  if (queue.length === 0) {
    return null
  }

  const currentReview = queue[currentIndex]
  const progress = ((currentIndex + 1) / queue.length) * 100

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Card {currentIndex + 1} of {queue.length}
            </span>
            {error && (
              <span className="text-sm text-red-400">{error}</span>
            )}
            {submitting && (
              <span className="text-sm text-gray-400">Submitting...</span>
            )}
          </div>
          <ProgressBar value={currentIndex + 1} max={queue.length} showLabel={false} />
        </div>

        <SessionCard
          reviewWithWord={currentReview}
          onRate={handleRate}
          mode="arabic-to-english"
        />
      </div>
    </main>
  )
}

