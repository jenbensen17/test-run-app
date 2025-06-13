'use client'

import { createClient } from './supabase/client'

export async function isEmailAllowed(email: string): Promise<boolean> {
  const supabase = createClient()
  
  // Get all allowed email configurations
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