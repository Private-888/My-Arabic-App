'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ReviewWithWord } from '@/lib/session/types'
import type { Rating } from '@/lib/srs/types'

interface SessionCardProps {
  reviewWithWord: ReviewWithWord
  onRate: (rating: Rating) => void
  mode?: 'arabic-to-english' | 'english-to-arabic'
}

export function SessionCard({
  reviewWithWord,
  onRate,
  mode = 'arabic-to-english',
}: SessionCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const { word } = reviewWithWord

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleRate = (rating: Rating) => {
    onRate(rating)
    setIsRevealed(false)
  }

  if (mode === 'arabic-to-english') {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-accent-400 mb-4" dir="rtl">
            {word.arabic}
          </div>
          {word.transliteration && (
            <div className="text-2xl text-gray-400 mb-4">
              {word.transliteration}
            </div>
          )}
        </div>

        {!isRevealed ? (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleReveal}
          >
            Reveal Answer
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="text-3xl font-semibold text-white mb-8">
              {word.meaning}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                onClick={() => handleRate('again')}
              >
                Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleRate('hard')}
              >
                Hard
              </Button>
              <Button
                variant="accent"
                onClick={() => handleRate('good')}
              >
                Good
              </Button>
              <Button
                variant="accent"
                onClick={() => handleRate('easy')}
              >
                Easy
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // English to Arabic mode (multiple choice could be added later)
  return (
    <Card className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="text-4xl font-bold text-white mb-4">
          {word.meaning}
        </div>
      </div>

      {!isRevealed ? (
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onClick={handleReveal}
        >
          Reveal Answer
        </Button>
      ) : (
        <div className="space-y-6">
          <div className="text-6xl font-bold text-accent-400 mb-4" dir="rtl">
            {word.arabic}
          </div>
          {word.transliteration && (
            <div className="text-2xl text-gray-400 mb-8">
              {word.transliteration}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="secondary"
              onClick={() => handleRate('again')}
            >
              Again
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleRate('hard')}
            >
              Hard
            </Button>
            <Button
              variant="accent"
              onClick={() => handleRate('good')}
            >
              Good
            </Button>
            <Button
              variant="accent"
              onClick={() => handleRate('easy')}
            >
              Easy
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

