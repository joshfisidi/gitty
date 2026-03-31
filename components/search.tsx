"use client"

import { useState, useCallback, useEffect } from "react"
import { Search as SearchIcon, X, Heart, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMovies } from "@/store/use-movies"
import { runSelectionPathAnimation } from "@/lib/selection-animation"
import type { Movie } from "@/lib/types"

export function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Movie[]>([])
  const [suggestions, setSuggestions] = useState<Movie[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addFavorite, removeFavorite, isFavorite, setSelectedMovie } = useMovies()

  const searchMovies = useCallback(async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setShowSuggestions(false)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length > 0) {
        setQuery(suggestions[0].title)
        setResults(suggestions)
        setShowSuggestions(false)
        return
      }
      searchMovies()
    }

    if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleMovieClick = (movie: Movie, el: HTMLElement) => {
    setSelectedMovie(movie)
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

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setSuggestions([])
    setShowSuggestions(false)
  }

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        const next = Array.isArray(data) ? data.slice(0, 6) : []
        setSuggestions(next)
        setShowSuggestions(next.length > 0)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 220)

    return () => window.clearTimeout(t)
  }, [query])

  return (
    <div className="w-full">
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true)
            }}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 120)
            }}
            placeholder="Search movies..."
            className="h-14 rounded-2xl border-border bg-card pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {showSuggestions && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              {suggestions.map((movie) => (
                <button
                  key={`suggest-${movie.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60"
                  onClick={() => {
                    setQuery(movie.title)
                    setResults(suggestions)
                    setShowSuggestions(false)
                  }}
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="h-10 w-7 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-7 rounded bg-secondary" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {movie.release_date?.split("-")[0] || "Unknown Year"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button
          onClick={searchMovies}
          disabled={isLoading || !query.trim()}
          className="h-14 rounded-2xl bg-primary px-8 text-primary-foreground hover:bg-accent"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 grid gap-4">
          {results.map((movie) => (
            <div
              key={movie.id}
              onClick={(e) => handleMovieClick(movie, e.currentTarget as HTMLElement)}
              className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="h-24 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-secondary text-muted-foreground text-xs">
                  No Image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {movie.release_date?.split("-")[0] || "Unknown Year"}
                </p>
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm text-foreground">{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => toggleFavorite(e, movie)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Heart
                  className={`h-6 w-6 transition-colors ${
                    isFavorite(movie.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
