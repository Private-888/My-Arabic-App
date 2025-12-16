'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/browser'

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleExport() {
    try {
      setExporting(true)
      setMessage('')

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('Please log in to export')
        return
      }

      const { data: words, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Convert to CSV
      const headers = ['Category', 'Term', 'Arabic', 'Transliteration', 'Meaning', 'Notes']
      const rows = words.map((word: any) => [
        word.category,
        word.term,
        word.arabic,
        word.transliteration || '',
        word.meaning,
        word.notes || '',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `arabic-words-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setMessage('Export successful!')
    } catch (error) {
      setMessage(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      setMessage('')

      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      
      if (lines.length < 2) {
        setMessage('CSV file must have at least a header row and one data row')
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
      const requiredHeaders = ['Category', 'Term', 'Arabic', 'Meaning']
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      )

      if (missingHeaders.length > 0) {
        setMessage(`Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('Please log in to import')
        return
      }

      // Parse CSV rows
      const words = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(',')
          .map((v) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))

        const categoryIndex = headers.indexOf('Category')
        const termIndex = headers.indexOf('Term')
        const arabicIndex = headers.indexOf('Arabic')
        const transliterationIndex = headers.indexOf('Transliteration')
        const meaningIndex = headers.indexOf('Meaning')
        const notesIndex = headers.indexOf('Notes')

        if (
          categoryIndex === -1 ||
          termIndex === -1 ||
          arabicIndex === -1 ||
          meaningIndex === -1
        ) {
          continue
        }

        words.push({
          user_id: user.id,
          category: values[categoryIndex] || '',
          term: values[termIndex] || '',
          arabic: values[arabicIndex] || '',
          transliteration:
            transliterationIndex !== -1 ? values[transliterationIndex] || null : null,
          meaning: values[meaningIndex] || '',
          notes: notesIndex !== -1 ? values[notesIndex] || null : null,
          dialect: 'Palestinian',
        })
      }

      // Upsert words and get their IDs
      const { data: insertedWords, error: insertError } = await supabase
        .from('words')
        .upsert(words, {
          onConflict: 'user_id,term,arabic',
        })
        .select()

      if (insertError) {
        throw insertError
      }

      if (!insertedWords) {
        throw new Error('Failed to insert words')
      }

      // Create initial reviews for new words
      const reviewsToInsert = []
      for (const word of insertedWords) {
        // Check if review already exists
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('word_id', word.id)
          .single()

        if (!existingReview) {
          reviewsToInsert.push({
            user_id: user.id,
            word_id: word.id,
            state: 'new',
            due_date: new Date().toISOString(),
            interval_days: 0,
            ease_factor: 2.5,
            repetition_count: 0,
            lapse_count: 0,
          })
        }
      }

      if (reviewsToInsert.length > 0) {
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert(reviewsToInsert)

        if (reviewError) {
          console.error('Error creating reviews:', reviewError)
          // Don't throw - words are imported even if reviews fail
        }
      }

      setMessage(`Successfully imported ${insertedWords.length} words!`)
      setTimeout(() => {
        window.location.href = '/word-bank'
      }, 2000)
    } catch (error) {
      setMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-accent-400 text-center">
          Import / Export
        </h1>

        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Export Words</h2>
          <p className="text-gray-400 mb-4">
            Download your entire word database as a CSV file.
          </p>
          <Button
            variant="accent"
            onClick={handleExport}
            disabled={exporting}
            fullWidth
          >
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Import Words</h2>
          <p className="text-gray-400 mb-4">
            Upload a CSV file to import words. Required columns: Category, Term,
            Arabic, Meaning. Optional: Transliteration, Notes.
          </p>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-400 file:text-primary-900 hover:file:bg-accent-300"
            />
            {importing && (
              <p className="text-accent-400">Importing words...</p>
            )}
          </div>
        </Card>

        {message && (
          <Card>
            <p
              className={`text-center ${
                message.includes('failed') || message.includes('error')
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}
            >
              {message}
            </p>
          </Card>
        )}
      </div>
    </main>
  )
}

