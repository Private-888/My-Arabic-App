import { redirect } from 'next/navigation'

// Force dynamic rendering - this route must be server-rendered
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootPage() {
  redirect('/home')
}

