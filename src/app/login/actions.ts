'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login')
  }

  // Redirect to a loading page that shows the check email message
  redirect('/login/check-email')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  
  const supabase = await createClient()

  // First, create the user
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
    password: ''
  })

  if (signUpError) {
    redirect('/login')
  }

  redirect('/login')
}