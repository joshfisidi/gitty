"use client"

import { useEffect, useMemo, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCards, Pagination } from "swiper/modules"
import { Heart, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "./star-rating"
import { useMovies } from "@/store/use-movies"
import type { Movie } from "@/lib/types"

import "swiper/css"
import "swiper/css/effect-cards"
import "swiper/css/pagination"

interface SwiperCardsProps {
  movies: Movie[]
}

type WatchProvider = {
  name: string
  url: string
}

const PROVIDER_LINKS: Array<{ match: string[]; url: string }> = [
  { match: ["netflix"], url: "https://www.netflix.com" },
  { match: ["disney+", "disney plus", "disney plus"], url: "https://www.disneyplus.com" },
  { match: ["prime video", "amazon prime"], url: "https://www.primevideo.com" },
  { match: ["apple tv", "apple tv+", "apple tv plus"], url: "https://tv.apple.com" },
  { match: ["hulu"], url: "https://www.hulu.com" },
  { match: ["max", "hbo max"], url: "https://www.max.com" },
  { match: ["crave"], url: "https://www.crave.ca" },
  { match: ["paramount+", "paramount plus"], url: "https://www.paramountplus.com" },
  { match: ["peacock"], url: "https://www.peacocktv.com" },
  { match: ["youtube"], url: "https://www.youtube.com" },
  { match: ["tubi"], url: "https://tubitv.com" },
  { match: ["pluto"], url: "https://pluto.tv" },
  { match: ["mubi"], url: "https://mubi.com" },
  { match: ["criterion"], url: "https://www.criterionchannel.com" },
  { match: ["crunchyroll"], url: "https://www.crunchyroll.com" },
]

function getProviderLink(name: string) {
  const normalized = name.toLowerCase()
  const found = PROVIDER_LINKS.find((item) => item.match.some((m) => normalized.includes(m)))
  if (found) return found.url
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} app`)}`
}

export function SwiperCards({ movies }: SwiperCardsProps) {
  const { removeFavorite, setSelectedMovie, openModal } = useMovies()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showSynopsis, setShowSynopsis] = useState(false)

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    removeFavorite(id)
  }

  const handleCardClick = (movie: Movie) => {
    setSelectedMovie(movie)
    openModal()
  }

  useEffect(() => {
    if (activeIndex >= movies.length) setActiveIndex(0)
  }, [movies.length, activeIndex])

  const activeMovie = useMemo(() => movies[activeIndex] ?? null, [movies, activeIndex])

  useEffect(() => {
    setShowSynopsis(false)
  }, [activeIndex])

  const [watchInfo, setWatchInfo] = useState<Record<number, WatchProvider[]>>({})

  useEffect(() => {
    let cancelled = false

    const fetchProviders = async () => {
      const next: Record<number, WatchProvider[]> = {}

      await Promise.all(
        movies.slice(0, 30).map(async (movie) => {
          try {
            const media = movie.media_type || "movie"
            const res = await fetch(`/api/movie/${movie.id}?media=${media}`)
            if (!res.ok) return
            const data = await res.json()
            const providers = data?.["watch/providers"]?.results?.CA || data?.["watch/providers"]?.results?.US
            const names = [
              ...(providers?.flatrate || []),
              ...(providers?.free || []),
              ...(providers?.ads || []),
              ...(providers?.rent || []),
              ...(providers?.buy || []),
            ]
              .map((p: any) => p?.provider_name)
              .filter(Boolean) as string[]

            const uniqueNames = Array.from(new Set(names)).slice(0, 5)
            const linked = uniqueNames.map((name) => ({ name, url: getProviderLink(name) }))

            if (linked.length) next[movie.id] = linked
          } catch {
            // ignore per-card provider failures
          }
        })
      )

      if (!cancelled) setWatchInfo(next)
    }

    if (movies.length > 0) fetchProviders()

    return () => {
      cancelled = true
    }
  }, [movies])

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Favorites Yet</h3>
        <p className="text-muted-foreground">
          Search for movies and add them to your collection
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[360px] space-y-4">
      <div className="h-[520px] sm:h-[560px]">
        <Swiper
          effect="cards"
          grabCursor
          modules={[EffectCards, Pagination]}
          pagination={{ clickable: true, el: ".favorites-swiper-pagination" }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full h-full"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id} className="rounded-2xl overflow-hidden">
              <div
                onClick={() => handleCardClick(movie)}
                className="relative h-full bg-card border border-border rounded-2xl overflow-hidden cursor-pointer group"
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">No Poster</span>
                  </div>
                )}

                {/* Subtle bottom fade only for poster readability */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black-deep/45 to-transparent" />

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(e, movie.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black-deep/50 backdrop-blur-sm text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className="favorites-swiper-pagination flex items-center justify-center"
        style={{ position: "static" }}
      />

      {activeMovie ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground line-clamp-1">{activeMovie.title}</h3>
              <p className="text-xs text-muted-foreground">
                {activeMovie.release_date?.split("-")[0] || "Unknown Year"}
              </p>
            </div>
            {activeMovie.vote_average > 0 ? <StarRating rating={activeMovie.vote_average} size="sm" /> : null}
          </div>

          {watchInfo[activeMovie.id]?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {watchInfo[activeMovie.id].map((provider) => (
                <a
                  key={`flat-${activeMovie.id}-${provider.name}`}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${provider.name}`}
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25"
                  >
                    {provider.name}
                  </Badge>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Where to watch unavailable.</p>
          )}

          {activeMovie.overview ? (
            <>
              <button
                type="button"
                onClick={() => setShowSynopsis((v) => !v)}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                {showSynopsis ? "Hide synopsis" : "Show synopsis"}
              </button>
              {showSynopsis ? <p className="mt-2 text-sm text-muted-foreground">{activeMovie.overview}</p> : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
