import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/navigation/BottomNav'
import Link from 'next/link'

export default async function GamesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const games = [
    {
      title: 'Word Match',
      description: 'Match Arabic words with their English meanings',
      icon: '🔗',
      href: '/games/word-match',
      color: 'accent',
    },
    {
      title: 'Quick Tap',
      description: 'Tap the correct translation under time pressure',
      icon: '⚡',
      href: '/games/quick-tap',
      color: 'secondary',
    },
    {
      title: 'Memory Flip',
      description: 'Match Arabic ↔ meaning cards',
      icon: '🎴',
      href: '/games/memory-flip',
      color: 'secondary',
    },
  ]

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-400 mb-8 text-center">
          Mini Games
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.href} interactive>
              <Link href={game.href}>
                <div className="text-center">
                  <div className="text-5xl mb-4">{game.icon}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {game.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {game.description}
                  </p>
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

