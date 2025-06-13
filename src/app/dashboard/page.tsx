import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import RoleSelector from '@/components/RoleSelector'
import DashboardLayout from '@/components/DashboardLayout'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user has a role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // If no role is set, show the role selector
  if (!roleData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
            <p className="mt-2 text-gray-600">
              Please select your role to continue
            </p>
            <div className="mt-6">
              <RoleSelector />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show the regular dashboard for users with roles
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your analytics dashboard
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Discussion Board</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and participate in class discussions
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 