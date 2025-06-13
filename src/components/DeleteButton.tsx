'use client'

type DeleteButtonProps = {
  onDelete: () => Promise<void>
  onDeleted?: () => void
  className?: string
  children: React.ReactNode
}

export default function DeleteButton({ onDelete, onDeleted, className, children }: DeleteButtonProps) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this?')) {
      await onDelete()
      onDeleted?.()
    }
  }

  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  )
} 