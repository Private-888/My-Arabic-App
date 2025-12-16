'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/browser'
import type { Word } from '@/lib/session/types'

export default function WordMatchPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [selectedArabic, setSelectedArabic] = useState<string | null>(null)
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameOver(true)
    }
  }, [timeLeft, gameOver])

  useEffect(() => {
    if (selectedArabic && selectedEnglish) {
      checkMatch()
    }
  }, [selectedArabic, selectedEnglish])

  async function loadWords() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .limit(12)
        .order('RANDOM()')

      if (data) {
        setWords(data)
      }
    } catch (error) {
      console.error('Error loading words:', error)
    } finally {
      setLoading(false)
    }
  }

  function checkMatch() {
    if (!selectedArabic || !selectedEnglish) return

    const arabicWord = words.find((w) => w.id === selectedArabic)
    const englishWord = words.find((w) => w.id === selectedEnglish)

    if (arabicWord && englishWord && arabicWord.id === englishWord.id) {
      setMatched(new Set([...matched, arabicWord.id]))
      setScore(score + 10)
      setSelectedArabic(null)
      setSelectedEnglish(null)

      if (matched.size + 1 === words.length) {
        setGameOver(true)
      }
    } else {
      setTimeout(() => {
        setSelectedArabic(null)
        setSelectedEnglish(null)
      }, 500)
    }
  }

  function handleCardClick(wordId: string, isArabic: boolean) {
    if (matched.has(wordId) || gameOver) return

    if (isArabic) {
      setSelectedArabic(selectedArabic === wordId ? null : wordId)
    } else {
      setSelectedEnglish(selectedEnglish === wordId ? null : wordId)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading game...</p>
        </div>
      </main>
    )
  }

  if (gameOver || matched.size === words.length) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-accent-400 mb-4">
            Game Over!
          </h1>
          <p className="text-2xl font-bold text-white mb-2">Score: {score}</p>
          <p className="text-gray-400 mb-8">
            {matched.size === words.length
              ? 'Perfect match!'
              : `Matched ${matched.size} of ${words.length} pairs`}
          </p>
          <div className="space-y-4">
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Play Again
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push('/games')}
            >
              Back to Games
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  const arabicWords = words
  const englishWords = [...words].sort(() => Math.random() - 0.5)

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-accent-400">Word Match</h1>
            <p className="text-gray-400">Match Arabic with English</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">Score: {score}</div>
            <div className="text-lg text-gray-400">Time: {timeLeft}s</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Arabic
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {arabicWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleCardClick(word.id, true)}
                  disabled={matched.has(word.id) || gameOver}
                  className={`p-4 rounded-xl text-center transition-all ${
                    matched.has(word.id)
                      ? 'bg-accent-400 text-primary-900 opacity-50'
                      : selectedArabic === word.id
                      ? 'bg-accent-400 text-primary-900'
                      : 'bg-primary-700 text-white hover:bg-primary-600'
                  }`}
                >
                  <div className="text-2xl font-bold" dir="rtl">
                    {word.arabic}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              English
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {englishWords.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleCardClick(word.id, false)}
                  disabled={matched.has(word.id) || gameOver}
                  className={`p-4 rounded-xl text-center transition-all ${
                    matched.has(word.id)
                      ? 'bg-accent-400 text-primary-900 opacity-50'
                      : selectedEnglish === word.id
                      ? 'bg-accent-400 text-primary-900'
                      : 'bg-primary-700 text-white hover:bg-primary-600'
                  }`}
                >
                  <div className="text-lg font-semibold">{word.meaning}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

