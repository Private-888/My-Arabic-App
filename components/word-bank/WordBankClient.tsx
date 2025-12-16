'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { Word } from '@/lib/session/types'

interface WordBankClientProps {
  initialWords: Word[]
  categories: string[]
  userId: string
}

interface WordBankClientState {
  words: Word[]
  searchTerm: string
  selectedCategory: string
  error: string | null
  deleting: string | null
}

export default function WordBankClient({
  initialWords,
  categories,
  userId,
}: WordBankClientProps) {
  const [words, setWords] = useState(initialWords)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.arabic.includes(searchTerm) ||
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (word.transliteration &&
        word.transliteration.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      selectedCategory === 'all' || word.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  async function handleDelete(wordId: string) {
    if (!confirm('Are you sure you want to delete this word?')) return

    try {
      setDeleting(wordId)
      setError(null)
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWords(words.filter((w) => w.id !== wordId))
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete word')
      }
    } catch (err) {
      setError('Failed to delete word. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  async function handleMarkKnown(wordId: string) {
    const response = await fetch(`/api/words/${wordId}/mark-known`, {
      method: 'POST',
    })

    if (response.ok) {
      // Refresh the page to show updated state
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by term, Arabic, meaning, or transliteration..."
              className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-400"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Words List */}
      <div className="space-y-4">
        {filteredWords.length === 0 ? (
          <Card>
            <EmptyState
              icon="📝"
              title="No Words Found"
              description={
                words.length === 0
                  ? 'Start building your vocabulary!'
                  : 'Try adjusting your search or filter.'
              }
              action={
                words.length === 0
                  ? {
                      label: 'Add Your First Word',
                      onClick: () => (window.location.href = '/word-bank/add'),
                    }
                  : undefined
              }
            />
          </Card>
        ) : (
          filteredWords.map((word) => (
            <Card key={word.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-xs px-3 py-1 bg-primary-600 rounded-full text-gray-300">
                      {word.category}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-accent-400 mb-2" dir="rtl">
                    {word.arabic}
                  </div>
                  {word.transliteration && (
                    <div className="text-lg text-gray-400 mb-2">
                      {word.transliteration}
                    </div>
                  )}
                  <div className="text-xl font-semibold text-white mb-1">
                    {word.term}
                  </div>
                  <div className="text-gray-300">{word.meaning}</div>
                  {word.notes && (
                    <div className="text-sm text-gray-400 mt-2 italic">
                      {word.notes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkKnown(word.id)}
                  >
                    Mark Known
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={`/word-bank/edit/${word.id}`}>Edit</a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(word.id)}
                    disabled={deleting === word.id}
                    className="text-red-400 hover:text-red-300"
                  >
                    {deleting === word.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

