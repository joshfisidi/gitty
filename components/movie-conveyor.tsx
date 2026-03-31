"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Heart, Star, Film } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMovies } from "@/store/use-movies"
import { runSelectionPathAnimation } from "@/lib/selection-animation"
import type { Movie } from "@/lib/types"

type MovieConveyorProps = {
  title?: string
  category?: "movies" | "tv" | "animation" | "anime"
  language?: string
  topic?: string
  window?: "day" | "week" | "month"
}

export function MovieConveyor({
  title = "Now Streaming",
  category = "movies",
  language,
  topic,
  window = "week",
}: MovieConveyorProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInViewport, setIsInViewport] = useState(true)
  const [page, setPage] = useState(1)
  const BATCH_PAGES = 5 // ~100 items at 20/page
  const BASE_SPEED = 0.02 // px/ms
  const MAX_SWIPE_VELOCITY = 2.2 // px/ms
  const INERTIA_DECAY = 0.985
  const conveyorRootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const scrollPositionRef = useRef(0)
  const userVelocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragLastXRef = useRef(0)
  const dragLastTimeRef = useRef(0)
  const dragMovedRef = useRef(false)
  const fetchInFlightRef = useRef(false)
  const hasMoreRef = useRef(true)
  const isHoveredRef = useRef(false)
  const isTouchInteractingRef = useRef(false)
  const pauseUntilRef = useRef(0)
  const swipeOverrideUntilRef = useRef(0)
  const { addFavorite, removeFavorite, isFavorite } = useMovies()

  const fetchMovies = useCallback(async (pageNum: number) => {
    try {
      const qs = new URLSearchParams({ page: String(pageNum), category, window })
      if (language) qs.set("language", language)
      if (topic) qs.set("topic", topic)

      const res = await fetch(`/api/trending?${qs.toString()}`)
      const data = await res.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Failed to fetch movies:", error)
      return []
    }
  }, [category, language, topic, window])

  const fetchBatch = useCallback(async (startPage: number, pages = BATCH_PAGES) => {
    const pageNums = Array.from({ length: pages }, (_, i) => startPage + i)
    const results = await Promise.all(pageNums.map((p) => fetchMovies(p)))
    return { pageNums, movies: results.flat() }
  }, [fetchMovies])

  const fetchNextPage = useCallback(async () => {
    if (fetchInFlightRef.current) return
    fetchInFlightRef.current = true

    try {
      const nextStart = page + 1
      let { pageNums, movies: newMovies } = await fetchBatch(nextStart)

      // If endpoint runs out, wrap so conveyor never hard-stops
      if (newMovies.length === 0 && hasMoreRef.current) {
        hasMoreRef.current = false
        const wrapped = await fetchBatch(1)
        pageNums = wrapped.pageNums
        newMovies = wrapped.movies
      }

      if (newMovies.length > 0) {
        setMovies((current) => {
          const merged = [...current, ...newMovies]
          // Destroy cards outside viewport history window to keep perf smooth
          if (merged.length > 420) {
            const removed = merged.length - 280
            scrollPositionRef.current = Math.max(0, scrollPositionRef.current - removed * (180 + 16))
            return merged.slice(-280)
          }
          return merged
        })
        setPage(pageNums[pageNums.length - 1] || nextStart)
      }
    } finally {
      fetchInFlightRef.current = false
    }
  }, [page, fetchBatch])

  useEffect(() => {
    const initMovies = async () => {
      const initial = await fetchBatch(1)
      setMovies(initial.movies)
      setPage(initial.pageNums[initial.pageNums.length - 1] || 1)
      setIsLoading(false)
    }
    initMovies()
  }, [fetchBatch])

  // Conveyor belt animation
  useEffect(() => {
    if (isLoading || movies.length === 0) return

    const scroll = scrollRef.current
    if (!scroll) return

    const cardWidth = 180 + 16 // card width + gap
    const totalWidth = movies.length * cardWidth

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (isInViewport && !isHoveredRef.current && !isTouchInteractingRef.current && timestamp >= pauseUntilRef.current) {
        // decay user fling velocity slowly so momentum carries like a film strip
        userVelocityRef.current *= INERTIA_DECAY
        if (Math.abs(userVelocityRef.current) < 0.005) userVelocityRef.current = 0

        // explicit swipe override window: belt base speed is fully disabled
        const inSwipeOverride = timestamp < swipeOverrideUntilRef.current
        const effectiveSpeed = inSwipeOverride
          ? userVelocityRef.current
          : Math.abs(userVelocityRef.current) > 0.03
            ? userVelocityRef.current
            : BASE_SPEED + userVelocityRef.current

        scrollPositionRef.current += delta * effectiveSpeed

        // keep in positive range for seamless loop
        const loopWidth = totalWidth / 2
        if (scrollPositionRef.current < 0) {
          scrollPositionRef.current = loopWidth + scrollPositionRef.current
        }

        // Prefetch before wrap for effectively limitless conveyor fill
        if (scrollPositionRef.current >= loopWidth * 0.75) {
          fetchNextPage()
        }

        // When we've scrolled past half the content, reset loop offset
        if (scrollPositionRef.current >= loopWidth) {
          scrollPositionRef.current = 0
        }

        if (scroll) {
          scroll.style.transform = `translateX(-${scrollPositionRef.current}px)`
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isLoading, movies.length, isInViewport, fetchNextPage])

  const handleMovieClick = (movie: Movie, el: HTMLElement) => {
    // On mobile tap, pause belt briefly so selection feels intentional
    pauseUntilRef.current = performance.now() + 900

    if (isFavorite(movie.id)) return

    addFavorite(movie)
    runSelectionPathAnimation(el)
  }

  const toggleFavorite = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation()
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id)
    } else {
      addFavorite(movie)
    }
  }

  const startDrag = (clientX: number) => {
    isDraggingRef.current = true
    dragMovedRef.current = false
    dragStartXRef.current = clientX
    dragLastXRef.current = clientX
    dragLastTimeRef.current = performance.now()
    // don't hard-reset velocity: repeated flicks can compound speed naturally
  }

  const moveDrag = (clientX: number) => {
    if (!isDraggingRef.current) return
    const now = performance.now()
    const dx = clientX - dragLastXRef.current
    const dt = Math.max(1, now - dragLastTimeRef.current)

    if (Math.abs(clientX - dragStartXRef.current) > 4) {
      dragMovedRef.current = true
    }

    // invert for natural horizontal swipe behavior
    scrollPositionRef.current -= dx

    // convert to px/ms velocity, boost, and accumulate so repeated swipes accelerate flow
    const instantVelocity = (-dx / dt) * 1.35
    const nextVelocity = userVelocityRef.current * 0.55 + instantVelocity
    userVelocityRef.current = Math.max(-MAX_SWIPE_VELOCITY, Math.min(MAX_SWIPE_VELOCITY, nextVelocity))
    swipeOverrideUntilRef.current = performance.now() + 2400

    dragLastXRef.current = clientX
    dragLastTimeRef.current = now
  }

  const endDrag = () => {
    isDraggingRef.current = false
  }

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Film className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: 180 }}>
              <Skeleton className="aspect-[2/3] rounded-xl" />
              <Skeleton className="mt-2 h-4 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Film className="h-6 w-6 text-primary animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      
      <div 
        className="overflow-hidden relative touch-pan-y select-none"
        onPointerDown={(e) => {
          if (e.pointerType === "touch" || e.pointerType === "pen") {
            isTouchInteractingRef.current = true
          }
          startDrag(e.clientX)
        }}
        onPointerMove={(e) => moveDrag(e.clientX)}
        onPointerUp={() => {
          endDrag()
          isTouchInteractingRef.current = false
        }}
        onPointerCancel={() => {
          endDrag()
          isTouchInteractingRef.current = false
        }}
        onTouchStart={(e) => {
          isTouchInteractingRef.current = true
          startDrag(e.touches[0]?.clientX ?? 0)
        }}
        onTouchMove={(e) => moveDrag(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={() => {
          endDrag()
          isTouchInteractingRef.current = false
        }}
        onTouchCancel={() => {
          endDrag()
          isTouchInteractingRef.current = false
        }}
      >
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div
          ref={scrollRef}
          className="flex gap-4 will-change-transform"
          style={{ width: "max-content" }}
        >
          {/* Duplicate movies for seamless loop */}
          {[...movies, ...movies].map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              onClick={(e) => {
                if (dragMovedRef.current) return
                handleMovieClick(movie, e.currentTarget as HTMLElement)
              }}
              onMouseEnter={() => {
                isHoveredRef.current = true
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false
              }}
              className="group cursor-pointer flex-shrink-0"
              style={{ width: 180 }}
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-card transition-all group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-105">
                {movie.poster_path ? (
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No Poster
                  </div>
                )}

                {isFavorite(movie.id) ? (
                  <div className="absolute top-2 left-2 z-20">
                    <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/90 px-2 py-0.5">
                      <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-primary-foreground">Saved</span>
                    </span>
                  </div>
                ) : null}

                {/* Favorite button overlay */}
                <button
                  onClick={(e) => toggleFavorite(e, movie)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black-deep/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      isFavorite(movie.id)
                        ? "fill-primary text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  />
                </button>


                {/* Rating badge */}
                {movie.vote_average > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black-deep/70 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {movie.release_date?.split("-")[0] || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
