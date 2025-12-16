import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/navigation/BottomNav'

export default async function CoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*, course_progress(*)')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-400 mb-8 text-center">
          Courses
        </h1>

        {!courses || courses.length === 0 ? (
          <Card className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No Courses Yet
            </h2>
            <p className="text-gray-400">
              Courses will appear here once you create them.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course: any) => {
              const progress = course.course_progress?.[0]
              const completedPercent = progress?.completed_percent || 0

              return (
                <Card key={course.id} interactive>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {course.title}
                    </h2>
                    {course.description && (
                      <p className="text-gray-400 text-sm mb-4">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{completedPercent}%</span>
                      </div>
                      <div className="w-full bg-primary-800 rounded-full h-2">
                        <div
                          className="bg-accent-400 h-2 rounded-full transition-all"
                          style={{ width: `${completedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

