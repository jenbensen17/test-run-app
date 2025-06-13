'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type Reply = {
  id: string
  content: string
  user_email: string
  is_ai_response: boolean
  created_at: string
  upvotes_count: number
  has_upvoted: boolean
}

type RepliesProps = {
  postId: string
  initialReplies: Reply[]
}

export default function Replies({ postId, initialReplies }: RepliesProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies)
  const [newReply, setNewReply] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`replies-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'replies',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: { user } } = await supabase.auth.getUser()
            const newReply = {
              ...payload.new,
              upvotes_count: 0,
              has_upvoted: false
            } as Reply
            setReplies(current => sortReplies([newReply, ...current]))
          } else if (payload.eventType === 'DELETE') {
            setReplies(current => current.filter(reply => reply.id !== payload.old.id))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upvotes',
          filter: `reply_id=in.(${replies.map(r => r.id).join(',')})`
        },
        async () => {
          // Refetch replies to get updated upvote counts
          const { data: updatedReplies } = await supabase
            .from('replies')
            .select(`
              *,
              upvotes:upvotes(count)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

          const { data: { user } } = await supabase.auth.getUser()
          const { data: userUpvotes } = await supabase
            .from('upvotes')
            .select('reply_id')
            .eq('user_id', user?.id)
            .in('reply_id', updatedReplies?.map(r => r.id) || [])

          const userUpvoteIds = new Set(userUpvotes?.map(u => u.reply_id))

          const transformedReplies = updatedReplies?.map(reply => ({
            ...reply,
            upvotes_count: reply.upvotes?.[0]?.count || 0,
            has_upvoted: userUpvoteIds.has(reply.id)
          })) || []

          setReplies(sortReplies(transformedReplies))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  const sortReplies = (repliesToSort: Reply[]) => {
    return repliesToSort.sort((a, b) => {
      if (b.upvotes_count !== a.upvotes_count) {
        return b.upvotes_count - a.upvotes_count
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create optimistic reply
      const optimisticReply: Reply = {
        id: 'temp-' + Date.now(),
        content: newReply.trim(),
        created_at: new Date().toISOString(),
        user_email: user.email || '',
        is_ai_response: false,
        upvotes_count: 0,
        has_upvoted: false
      }

      // Add optimistic reply to the list
      setReplies(current => [...current, optimisticReply])
      setNewReply('')

      // Then make the actual database call
      const { data: reply, error } = await supabase
        .from('replies')
        .insert([{
          content: newReply.trim(),
          post_id: postId,
          user_id: user.id,
          user_email: user.email,
          is_ai_response: false
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Replace optimistic reply with real one
      setReplies(current =>
        current.map(r => r.id === optimisticReply.id ? {
          ...reply,
          upvotes_count: 0,
          has_upvoted: false
        } : r)
      )
    } catch (error) {
      console.error('Error submitting reply:', error)
      // Remove optimistic reply on error
      setReplies(current => current.filter(r => !r.id.startsWith('temp-')))
      setNewReply(newReply) // Restore the content
    }
  }

  const handleUpvote = async (replyId: string, hasUpvoted: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Optimistically update the UI without reordering
      setReplies(current =>
        current.map(reply =>
          reply.id === replyId
            ? {
                ...reply,
                upvotes_count: hasUpvoted ? reply.upvotes_count - 1 : reply.upvotes_count + 1,
                has_upvoted: !hasUpvoted
              }
            : reply
        )
      )

      // Then update the database
      if (hasUpvoted) {
        await supabase
          .from('upvotes')
          .delete()
          .match({ reply_id: replyId, user_id: user.id })
      } else {
        await supabase
          .from('upvotes')
          .insert([{ reply_id: replyId, user_id: user.id }])
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
      // Revert the optimistic update if there's an error
      const { data: { user } } = await supabase.auth.getUser()
      const { data: updatedReplies } = await supabase
        .from('replies')
        .select(`
          *,
          upvotes:upvotes(count)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      const { data: userUpvotes } = await supabase
        .from('upvotes')
        .select('reply_id')
        .eq('user_id', user?.id)
        .in('reply_id', updatedReplies?.map(r => r.id) || [])

      const userUpvoteIds = new Set(userUpvotes?.map(u => u.reply_id))

      const transformedReplies = updatedReplies?.map(reply => ({
        ...reply,
        upvotes_count: reply.upvotes?.[0]?.count || 0,
        has_upvoted: userUpvoteIds.has(reply.id)
      })) || []

      setReplies(transformedReplies)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Reply Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
            Add a Reply
          </label>
          <textarea
            id="reply"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            style={{ padding: '10px' }}
            placeholder="Write your reply here..."
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Reply'}
          </button>
        </div>
      </form>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {reply.is_ai_response ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        AI Assistant
                      </span>
                    ) : (
                      reply.user_email
                    )}
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{reply.content}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(reply.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleUpvote(reply.id, reply.has_upvoted)}
                className={`ml-4 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  reply.has_upvoted
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span>{reply.upvotes_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 