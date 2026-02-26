import { Grade } from '@/lib/types'

const colors: Record<Grade, string> = {
  A: 'bg-grade-a text-white',
  B: 'bg-grade-b text-white',
  C: 'bg-grade-c text-white',
  D: 'bg-grade-d text-white',
  F: 'bg-grade-f text-white',
}

export function GradeBadge({ grade, size = 'md' }: { grade: Grade; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-20 h-20 text-4xl' : 'w-12 h-12 text-xl'
  return (
    <div className={`${sizeClass} ${colors[grade]} rounded-full flex items-center justify-center font-serif font-bold`}>
      {grade}
    </div>
  )
}
