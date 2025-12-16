'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/browser'
import type { Word } from '@/lib/session/types'

interface CardData {
  id: string
  word: Word
  type: 'arabic' | 'english'
  flipped: boolean
  matched: boolean
}

export default function MemoryFlipPage() {
  const router = useRouter()
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [])

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch()
    }
  }, [flippedCards])

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
        .limit(8)
        .order('RANDOM()')

      if (data) {
        const cardData: CardData[] = []
        data.forEach((word: Word) => {
          cardData.push({
            id: `${word.id}-arabic`,
            word,
            type: 'arabic',
            flipped: false,
            matched: false,
          })
          cardData.push({
            id: `${word.id}-english`,
            word,
            type: 'english',
            flipped: false,
            matched: false,
          })
        })
        setCards(cardData.sort(() => Math.random() - 0.5))
      }
    } catch (error) {
      console.error('Error loading words:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCardClick(cardId: string) {
    if (gameOver || flippedCards.length >= 2) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.flipped || card.matched) return

    setCards(
      cards.map((c) =>
        c.id === cardId ? { ...c, flipped: true } : c
      )
    )
    setFlippedCards([...flippedCards, cardId])
  }

  function checkMatch() {
    if (flippedCards.length !== 2) return

    const [card1Id, card2Id] = flippedCards
    const card1 = cards.find((c) => c.id === card1Id)
    const card2 = cards.find((c) => c.id === card2Id)

    if (card1 && card2 && card1.word.id === card2.word.id) {
      // Match!
      setCards(
        cards.map((c) =>
          c.word.id === card1.word.id ? { ...c, matched: true } : c
        )
      )
      setScore(score + 20)
      setFlippedCards([])

      // Check if game is over
      if (cards.filter((c) => c.matched).length + 2 === cards.length) {
        setTimeout(() => setGameOver(true), 500)
      }
    } else {
      // No match, flip back
      setTimeout(() => {
        setCards(
          cards.map((c) =>
            flippedCards.includes(c.id) && !c.matched
              ? { ...c, flipped: false }
              : c
          )
        )
        setFlippedCards([])
      }, 1000)
    }

    setMoves(moves + 1)
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
          <div className="text-6xl mb-6">🎴</div>
          <h1 className="text-3xl font-bold text-accent-400 mb-4">
            You Win!
          </h1>
          <p className="text-2xl font-bold text-white mb-2">Final Score: {score}</p>
          <p className="text-gray-400 mb-2">Moves: {moves}</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-accent-400">Memory Flip</h1>
            <p className="text-gray-400">Match the pairs!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">Score: {score}</div>
            <div className="text-lg text-gray-400">Moves: {moves}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched || flippedCards.length >= 2}
              className={`aspect-square rounded-xl transition-all ${
                card.matched
                  ? 'bg-accent-400 text-primary-900 opacity-50'
                  : card.flipped
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-700 text-white hover:bg-primary-600'
              } flex items-center justify-center p-4`}
            >
              {card.flipped || card.matched ? (
                <div className="text-center">
                  {card.type === 'arabic' ? (
                    <div className="text-3xl font-bold" dir="rtl">
                      {card.word.arabic}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold">
                      {card.word.meaning}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-4xl">🎴</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

