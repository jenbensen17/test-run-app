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

  // Get user's role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

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
      user_email: user.email,
      user_role: roleData?.role || 'student', // Default to student if no role is set
      pinned: false // Set default value for pinned
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
  return { success: true }
}

export async function markPostResolved(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // First check if the user is the post author or an instructor
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  const isInstructor = roleData?.role === 'instructor'
  if (!post || (!isInstructor && post.user_id !== user.id)) {
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

export async function togglePinPost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if the user is an instructor
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData || roleData.role !== 'instructor') {
    redirect('/discussion')
  }

  // Get current pin status
  const { data: post } = await supabase
    .from('posts')
    .select('pinned')
    .eq('id', postId)
    .single()

  const { error } = await supabase
    .from('posts')
    .update({ pinned: !post?.pinned })
    .eq('id', postId)

  if (error) {
    console.error('Error toggling pin status:', error)
    redirect('/discussion')
  }

  revalidatePath('/discussion')
}

export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if the user is an instructor
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData || roleData.role !== 'instructor') {
    redirect('/discussion')
  }

  // Delete all replies first (due to foreign key constraints)
  const { error: replyError } = await supabase
    .from('replies')
    .delete()
    .eq('post_id', postId)

  if (replyError) {
    console.error('Error deleting replies:', replyError)
    redirect('/discussion')
  }

  // Then delete the post
  const { error: postError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (postError) {
    console.error('Error deleting post:', postError)
    redirect('/discussion')
  }

  revalidatePath('/discussion')
}

export async function deleteReply(replyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if the user is an instructor
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData || roleData.role !== 'instructor') {
    redirect('/discussion')
  }

  const { error } = await supabase
    .from('replies')
    .delete()
    .eq('id', replyId)

  if (error) {
    console.error('Error deleting reply:', error)
    redirect('/discussion')
  }

  revalidatePath('/discussion')
} 