import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton'
import { BottomNav } from '@/components/navigation/BottomNav'
import Link from 'next/link'
import { getCurrentStreak } from '@/lib/stats/streak'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get today's stats
  const today = new Date().toISOString().split('T')[0]
  const { data: todayStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Create profile if it doesn't exist
  if (!profile) {
    await supabase.from('profiles').insert({
      user_id: user.id,
      dialect: 'Palestinian',
      daily_goal: 20,
      level: 1,
      xp: 0,
    })
  }

  const streak = await getCurrentStreak(user.id)
  const dailyGoal = profile?.daily_goal || 20
  const reviewsCompleted = todayStats?.reviews_completed || 0
  const xpEarned = todayStats?.xp_earned || 0
  const level = profile?.level || 1
  const totalXP = profile?.xp || 0

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-400 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-400">Level {level} • {totalXP} XP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Today's Progress</h2>
            <ProgressBar
              value={reviewsCompleted}
              max={dailyGoal}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{reviewsCompleted} reviews</span>
              <span>{xpEarned} XP</span>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Streak</h2>
            <div className="text-5xl font-bold text-accent-400 mb-2">
              🔥 {streak}
            </div>
            <p className="text-gray-400 text-sm">days in a row</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/session">
              <Button variant="accent" size="lg" fullWidth>
                Start Daily Session
              </Button>
            </Link>
            <Link href="/word-bank">
              <Button variant="secondary" size="lg" fullWidth>
                Word Bank
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="secondary" size="lg" fullWidth>
                Practice Hub
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="secondary" size="lg" fullWidth>
                Courses
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <FloatingActionButton href="/session" />
      <BottomNav />
    </main>
  )
}

