import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect to dashboard if authenticated, login if not
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
