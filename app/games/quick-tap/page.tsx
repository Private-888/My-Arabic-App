'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/browser'
import type { Word } from '@/lib/session/types'

export default function QuickTapPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      nextQuestion()
    }
  }, [words])

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameOver(true)
    }
  }, [timeLeft, gameOver])

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
        .limit(50)
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

  function nextQuestion() {
    if (words.length === 0) return

    const word = words[Math.floor(Math.random() * words.length)]
    const wrongOptions = words
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.meaning)

    const allOptions = [word.meaning, ...wrongOptions].sort(
      () => Math.random() - 0.5
    )

    setCurrentWord(word)
    setOptions(allOptions)
  }

  function handleAnswer(answer: string) {
    if (!currentWord || gameOver) return

    if (answer === currentWord.meaning) {
      setScore(score + 10)
      nextQuestion()
    } else {
      setScore(Math.max(0, score - 5))
      nextQuestion()
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

  if (gameOver) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-3xl font-bold text-accent-400 mb-4">
            Time&apos;s Up!
          </h1>
          <p className="text-2xl font-bold text-white mb-2">Final Score: {score}</p>
          <div className="space-y-4 mt-8">
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

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-accent-400">Quick Tap</h1>
            <p className="text-gray-400">Tap the correct answer fast!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">Score: {score}</div>
            <div className="text-lg text-gray-400">Time: {timeLeft}s</div>
          </div>
        </div>

        {currentWord && (
          <Card className="text-center mb-6">
            <div className="text-6xl font-bold text-accent-400 mb-4" dir="rtl">
              {currentWord.arabic}
            </div>
            {currentWord.transliteration && (
              <div className="text-2xl text-gray-400 mb-6">
                {currentWord.transliteration}
              </div>
            )}
            <p className="text-lg text-gray-300 mb-8">
              What does this mean?
            </p>

            <div className="grid grid-cols-2 gap-4">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  className="h-20 text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}

