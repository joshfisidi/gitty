"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, maxStars = 5, size = "md" }: StarRatingProps) {
  const stars = Math.round(rating / 2)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < stars
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
