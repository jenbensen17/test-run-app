'use server'

import { createClient } from '@/utils/supabase/server'
import { generateAIResponse } from '@/utils/gemini'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const topic = formData.get('topic') as string

  if (!title || !content || !topic) {
    throw new Error('Missing required fields')
  }

  // Create the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert([{
      title,
      content,
      topic,
      user_id: user.id,
      user_email: user.email
    }])
    .select()
    .single()

  if (postError) {
    console.error('Error creating post:', postError)
    redirect('/discussion')
  }

  // Generate AI response
  const aiResponse = await generateAIResponse(content)

  // Create the AI reply
  const { error: replyError } = await supabase
    .from('replies')
    .insert([{
      content: aiResponse,
      post_id: post.id,
      user_id: user.id,
      user_email: 'ai-assistant@byu.edu',
      is_ai_response: true
    }])

  if (replyError) {
    console.error('Error creating AI reply:', replyError)
  }

  // Revalidate the discussion page to show the new post
  revalidatePath('/discussion')
  redirect('/discussion')
}

export async function markPostResolved(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // First check if the user is the post author
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    redirect('/discussion')
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'resolved' })
    .eq('id', postId)

  if (error) {
    console.error('Error marking post as resolved:', error)
    redirect('/discussion')
  }

  revalidatePath('/discussion')
  redirect('/discussion')
} 