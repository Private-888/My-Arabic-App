'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-accent-400 mb-6 text-center">
          Welcome to My Arabic App
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400"
              placeholder="your@email.com"
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
          {message && (
            <p className={`text-sm text-center ${
              message.includes('error') || message.includes('Error')
                ? 'text-red-400'
                : 'text-green-400'
            }`}>
              {message}
            </p>
          )}
        </form>
      </Card>
    </main>
  )
}

