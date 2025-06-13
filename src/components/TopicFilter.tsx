'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TOPICS = [
  { value: '', label: 'All Topics' },
  { value: 'regression', label: 'Regression' },
  { value: 'ggplot2', label: 'ggplot2' },
  { value: 'data-cleaning', label: 'Data Cleaning' },
  { value: 'other', label: 'Other' }
]

export default function TopicFilter({ currentTopic }: { currentTopic?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTopicChange = (topic: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (topic) {
      params.set('topic', topic)
    } else {
      params.delete('topic')
    }
    router.replace(`/discussion?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex space-x-2">
      {TOPICS.map((topic) => (
        <button
          key={topic.value}
          onClick={() => handleTopicChange(topic.value)}
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            (currentTopic === topic.value) || (!currentTopic && topic.value === '')
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {topic.label}
        </button>
      ))}
    </div>
  )
} 