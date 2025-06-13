'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function RoleSelector() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleRoleSelect = async (role: 'instructor' | 'student') => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('user_roles')
        .insert([
          {
            role,
            user_id: user.id,
            email: user.email,
          },
        ])

      if (error) throw error

      // Refresh the page to show the updated UI
      window.location.reload()
    } catch (error) {
      console.error('Error setting role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Select Your Role</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select your role. This cannot be changed later.
        </p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => handleRoleSelect('instructor')}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 border-2 border-orange-500 hover:bg-orange-500/20 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 transition-colors"
          >
            Instructor
          </button>
          <button
            onClick={() => handleRoleSelect('student')}
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 border-2 border-blue-500 hover:bg-blue-500/20 hover:text-blue-700 disabled:opacity-50 transition-colors"
          >
            Student
          </button>
        </div>
      </div>
    </div>
  )
} 