import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/navigation/BottomNav'
import { getCurrentStreak } from '@/lib/stats/streak'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

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
  const level = profile?.level || 1
  const totalXP = profile?.xp || 0
  const dailyGoal = profile?.daily_goal || 20

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-accent-400 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            👤
          </div>
          <h1 className="text-4xl font-bold text-accent-400 mb-2">Profile</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-accent-400 mb-1">
                {level}
              </div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-400 mb-1">
                {totalXP}
              </div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-400 mb-1">
                🔥 {streak}
              </div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-400 mb-1">
                {dailyGoal}
              </div>
              <div className="text-sm text-gray-400">Daily Goal</div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dialect
              </label>
              <div className="px-4 py-3 bg-primary-800 rounded-xl text-white">
                Palestinian (default)
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-white mb-4">Account</h2>
          <div className="space-y-4">
            <LogoutButton />
          </div>
        </Card>
      </div>

      <BottomNav />
    </main>
  )
}

