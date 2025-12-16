import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import WordBankClient from '@/components/word-bank/WordBankClient'

export default async function WordBankPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('words')
    .select('category')
    .eq('user_id', user.id)

  const uniqueCategories = Array.from(
    new Set(categories?.map((c) => c.category) || [])
  ).sort()

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-accent-400">Word Bank</h1>
          <div className="flex gap-4">
            <Button variant="secondary" asChild>
              <a href="/import-export">Import/Export</a>
            </Button>
            <Button variant="accent" asChild>
              <a href="/word-bank/add">Add Word</a>
            </Button>
          </div>
        </div>

        <WordBankClient
          initialWords={words || []}
          categories={uniqueCategories}
          userId={user.id}
        />
      </div>
    </main>
  )
}

