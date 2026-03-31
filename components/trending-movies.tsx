"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Heart, Star } from "lucide-react"
import { useMovies } from "@/store/use-movies"
import type { Movie } from "@/lib/types"

export function TrendingMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addFavorite, removeFavorite, isFavorite, setSelectedMovie, openModal } = useMovies()

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending")
        const data = await res.json()
        setMovies(Array.isArray(data) ? data.slice(0, 10) : [])
      } catch (error) {
        console.error("Failed to fetch trending movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie)
    openModal()
  }

  const toggleFavorite = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation()
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id)
    } else {
      addFavorite(movie)
    }
  }

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-card" />
              <div className="mt-2 h-4 bg-card rounded w-3/4" />
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
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Trending This Week</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => handleMovieClick(movie)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-card transition-all group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No Poster
                </div>
              )}

              {/* Favorite button overlay */}
              <button
                onClick={(e) => toggleFavorite(e, movie)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black-deep/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart
                  className={`h-5 w-5 ${
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
  )
}
