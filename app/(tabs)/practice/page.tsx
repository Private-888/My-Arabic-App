import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/navigation/BottomNav'
import Link from 'next/link'

export default async function PracticePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const practiceModes = [
    {
      title: 'Daily Quiz',
      description: 'Auto-generated mix of due, random, and weak words',
      icon: '📅',
      href: '/session',
      color: 'accent',
    },
    {
      title: 'Free Practice',
      description: 'Choose your category, course, or scenario',
      icon: '🎯',
      href: '/practice/free',
      color: 'secondary',
    },
    {
      title: 'Random Words',
      description: 'Practice random words from your bank',
      icon: '🎲',
      href: '/practice/random',
      color: 'secondary',
    },
    {
      title: 'Bookmarked Words',
      description: 'Practice your saved words',
      icon: '⭐',
      href: '/practice/bookmarked',
      color: 'secondary',
    },
  ]

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-400 mb-8 text-center">
          Practice Hub
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceModes.map((mode) => (
            <Card key={mode.href} interactive>
              <Link href={mode.href}>
                <div className="text-center">
                  <div className="text-5xl mb-4">{mode.icon}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {mode.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {mode.description}
                  </p>
                  <Button variant={mode.color as any} size="md" fullWidth>
                    Start
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

