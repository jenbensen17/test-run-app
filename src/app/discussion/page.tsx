import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createPost } from './actions'
import Replies from '@/components/Replies'

export default async function DiscussionPage() {
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

  if (!roleData) {
    redirect('/dashboard')
  }

  // Fetch posts with reply counts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      replies:replies(count)
    `)
    .order('created_at', { ascending: false })

  // Fetch replies for each post
  const postsWithReplies = await Promise.all(
    posts?.map(async (post) => {
      const { data: replies } = await supabase
        .from('replies')
        .select(`
          *,
          upvotes:upvotes(count)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      // Get user's upvotes for these replies
      const { data: userUpvotes } = await supabase
        .from('upvotes')
        .select('reply_id')
        .eq('user_id', user.id)
        .in('reply_id', replies?.map(r => r.id) || [])

      const userUpvoteIds = new Set(userUpvotes?.map(u => u.reply_id))

      // Transform replies to include upvote count and user's upvote status
      const transformedReplies = replies?.map(reply => ({
        ...reply,
        upvotes_count: reply.upvotes?.[0]?.count || 0,
        has_upvoted: userUpvoteIds.has(reply.id)
      })) || []

      // Sort replies by upvote count (descending) and then by creation date (ascending)
      const sortedReplies = transformedReplies.sort((a, b) => {
        if (b.upvotes_count !== a.upvotes_count) {
          return b.upvotes_count - a.upvotes_count
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })

      return {
        ...post,
        replies: sortedReplies
      }
    }) || []
  )

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discussion Board</h1>
        <p className="mt-2 text-gray-600">
          Ask questions and get help from the AI assistant
        </p>

        {/* Question Form */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Ask a Question</h3>
            <form className="mt-4 space-y-4" action={createPost}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  style={{ padding: '10px' }}
                  placeholder="Brief description of your question"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Question
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  style={{ padding: '10px' }}
                  placeholder="Describe your question in detail. Include any code snippets or error messages if applicable."
                />
              </div>
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Topic
                </label>
                <select
                  id="topic"
                  name="topic"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  style={{ padding: '10px' }}
                >
                  <option value="">Select a topic</option>
                  <option value="regression">Regression</option>
                  <option value="ggplot2">ggplot2</option>
                  <option value="data-cleaning">Data Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Questions List */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Questions</h2>
          <div className="mt-4 space-y-6">
            {postsWithReplies.length > 0 ? (
              postsWithReplies.map((post) => (
                <div key={post.id} className="bg-white shadow rounded-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Posted by {post.user_email} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{post.content}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {post.topic}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-4">
                    <Replies postId={post.id} initialReplies={post.replies} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No questions yet. Be the first to ask!</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 