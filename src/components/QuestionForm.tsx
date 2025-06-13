'use client'

import { useState } from 'react'
import { createPost } from '@/app/discussion/actions'

export default function QuestionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createPost(formData)
      if (result.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error submitting question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Ask a Question</h3>
        <form className="mt-4 space-y-4" action={handleSubmit}>
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
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 