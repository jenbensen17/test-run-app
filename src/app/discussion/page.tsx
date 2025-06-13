import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createPost } from './actions'

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

  // Fetch posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

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
          <div className="mt-4 space-y-4">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="bg-white shadow rounded-lg p-4">
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