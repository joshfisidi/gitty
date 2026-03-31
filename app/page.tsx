"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { Search } from "@/components/search"
import { FavoritesButton } from "@/components/favorites-button"
import { Skeleton } from "@/components/ui/skeleton"

const STREAMS = [
  { title: "Trending JavaScript", category: "movies" as const },
  { title: "Trending TypeScript", category: "tv" as const },
  { title: "Trending Python", category: "animation" as const },
  { title: "Trending Rust", category: "anime" as const },
]

const MovieConveyor = dynamic(
  () => import("@/components/movie-conveyor").then((m) => m.MovieConveyor),
  {
    loading: () => (
      <div className="mt-12">
        <Skeleton className="h-6 w-52 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: 180 }}>
              <Skeleton className="aspect-[2/3] rounded-xl" />
              <Skeleton className="mt-2 h-4 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-border bg-black">
              <Image src="/logo.png" alt="Flickle logo" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gitty</h1>
              <p className="text-xs text-muted-foreground">Your GitHub Project Radar</p>
            </div>
          </div>
          <FavoritesButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            Track the Best
            <span className="text-primary"> GitHub Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover trending repos, save your stack, and open repos instantly
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <Search />
        </div>

        {/* Streaming rails */}
        <div className="space-y-10">
          {STREAMS.map((stream) => (
            <MovieConveyor
              key={stream.category}
              title={stream.title}
              category={stream.category}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">Fisidi Inc.</p>
        </div>
      </footer>

    </main>
  )
}
