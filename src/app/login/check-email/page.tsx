import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default async function CheckEmailPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-md mx-auto">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <LoadingSpinner />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We&apos;ve sent you a magic link. Click the link in your email to sign in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 