'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating?: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (rating: number) => void
  disabled?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRate,
  disabled = false
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const displayRating = isHovering ? hoverRating : rating
  const starSize = sizeClasses[size]

  const handleMouseEnter = (index: number) => {
    if (interactive && !disabled) {
      setHoverRating(index)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (interactive && !disabled) {
      setHoverRating(0)
      setIsHovering(false)
    }
  }

  const handleClick = (index: number) => {
    if (interactive && !disabled && onRate) {
      onRate(index)
    }
  }

  return (
    <div 
      className="flex items-center gap-0.5" 
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starNumber = index + 1
        const isFilled = starNumber <= displayRating

        return (
          <button
            key={index}
            type="button"
            disabled={disabled || !interactive}
            className={cn(
              'transition-transform hover:scale-110 focus:outline-none',
              interactive && !disabled ? 'cursor-pointer' : 'cursor-default'
            )}
            onMouseEnter={() => handleMouseEnter(starNumber)}
            onClick={() => handleClick(starNumber)}
          >
            <Star
              className={cn(
                starSize,
                'transition-colors',
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-muted text-muted-foreground/25',
                interactive && !disabled && 'hover:fill-yellow-400 hover:text-yellow-400'
              )}
            />
          </button>
        )
      })}
    </div>
  )
} 