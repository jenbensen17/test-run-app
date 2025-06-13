'use client'

import TopicFilter from './TopicFilter'

export default function TopicFilterWrapper({ currentTopic }: { currentTopic?: string }) {
  return <TopicFilter currentTopic={currentTopic} />
} 