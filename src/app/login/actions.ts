'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

async function checkEmailAllowed(email: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: allowedEmails, error } = await supabase
    .from('allowed_emails')
    .select('type, value')

  if (error || !allowedEmails) {
    console.error('Error checking allowed emails:', error)
    return false
  }

  // Check if the exact email is in the allowed list
  const isSpecificEmailAllowed = allowedEmails.some(
    (allowed) => allowed.type === 'specific' && allowed.value.toLowerCase() === email.toLowerCase()
  )

  if (isSpecificEmailAllowed) {
    return true
  }

  // Extract domain from email
  const emailDomain = email.split('@')[1]?.toLowerCase()
  
  // Check if the domain is in the allowed list
  const isDomainAllowed = allowedEmails.some(
    (allowed) => allowed.type === 'domain' && allowed.value.toLowerCase() === emailDomain
  )

  return isDomainAllowed
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  
  // Double-check on server side that email is allowed
  const allowed = await checkEmailAllowed(email)
  if (!allowed) {
    redirect('/login?error=unauthorized_email')
  }

  const supabase = await createClient()

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
    password: ''
  })

  if (signUpError) {
    console.error('Signup error:', signUpError)
    redirect('/login?error=signup_failed')
  }

  redirect('/login/check-email')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  
  // Check if email is allowed before login
  const allowed = await checkEmailAllowed(email)
  if (!allowed) {
    redirect('/login?error=unauthorized_email')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=login_failed')
  }

  redirect('/login/check-email')
}