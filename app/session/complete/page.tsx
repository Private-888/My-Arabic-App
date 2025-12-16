'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function SessionCompletePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-accent-400 mb-4">
          Session Complete!
        </h1>
        <p className="text-gray-400 mb-8">
          Great work! You&apos;ve completed today&apos;s practice session.
        </p>
        <div className="space-y-4">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={() => router.push('/home')}
          >
            Back to Home
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => router.push('/session')}
          >
            Practice More
          </Button>
        </div>
      </Card>
    </main>
  )
}

