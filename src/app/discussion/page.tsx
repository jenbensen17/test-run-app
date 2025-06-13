import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createPost, markPostResolved, togglePinPost, deletePost } from './actions'
import Replies from '@/components/Replies'
import TopicFilterWrapper from '@/components/TopicFilterWrapper'
import { useRouter } from 'next/navigation'
import QuestionForm from '@/components/QuestionForm'
import DeleteButton from '@/components/DeleteButton'

export default async function DiscussionPage(
  props: {
    searchParams: Promise<{ topic?: string }>
  }
) {
  const searchParams = await props.searchParams;
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

  const isInstructor = roleData.role === 'instructor'

  // Build the query based on topic filter
  let query = supabase
    .from('posts')
    .select(`
      *,
      replies:replies(count)
    `)
    .order('pinned', { ascending: false }) // Sort pinned posts first
    .order('created_at', { ascending: false })

  // Apply topic filter if specified
  if (searchParams.topic) {
    query = query.eq('topic', searchParams.topic)
  }

  // Fetch posts with reply counts
  const { data: posts } = await query

  // Get user roles for all posts
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', posts?.map(p => p.user_id) || [])

  const userRoleMap = new Map(userRoles?.map(ur => [ur.user_id, ur.role]) || [])

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
        replies: sortedReplies,
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
        <QuestionForm />

        {/* Questions List */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Questions</h2>
            <TopicFilterWrapper currentTopic={searchParams.topic} />
          </div>
          <div className="mt-4 space-y-6">
            {postsWithReplies.length > 0 ? (
              postsWithReplies.map((post) => (
                <div key={post.id} className="bg-white shadow rounded-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {post.pinned && (
                            <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              📌 Pinned
                            </span>
                          )}
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Posted by <span className="font-medium">{post.user_email}</span>
                          {post.user_role && (
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.user_role === 'student' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {post.user_role}
                            </span>
                          )}
                          <br /><span className="text-gray-400">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {post.topic}
                        </span>
                        {isInstructor && (
                          <>
                            <form action={togglePinPost.bind(null, post.id)}>
                              <button
                                type="submit"
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  post.pinned
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                {post.pinned ? 'Unpin' : 'Pin'}
                              </button>
                            </form>
                            <form action={deletePost.bind(null, post.id)}>
                              <DeleteButton
                                onDelete={deletePost.bind(null, post.id)}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                Delete
                              </DeleteButton>
                            </form>
                          </>
                        )}
                        {post.status === 'resolved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Resolved
                          </span>
                        ) : (post.user_id === user.id || isInstructor) ? (
                          <form action={markPostResolved.bind(null, post.id)}>
                            <button
                              type="submit"
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                              Mark as Resolved
                            </button>
                          </form>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-gray-600 whitespace-pre-wrap">{post.content}</div>
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