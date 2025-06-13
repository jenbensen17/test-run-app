'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const topic = formData.get('topic') as string

  if (!title || !content || !topic) {
    throw new Error('Missing required fields')
  }

  const { error } = await supabase
    .from('posts')
    .insert([
      {
        title,
        content,
        topic,
        user_id: user.id,
        user_email: user.email,
        status: 'pending', // pending, answered, resolved
        created_at: new Date().toISOString(),
      }
    ])

  if (error) {
    throw new Error('Failed to create post')
  }

  // Revalidate the discussion page to show the new post
  revalidatePath('/discussion')
} 