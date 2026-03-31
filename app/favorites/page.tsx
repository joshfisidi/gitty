"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMovies } from "@/store/use-movies"

const SwiperCards = dynamic(
  () => import("@/components/swiper-cards").then((m) => m.SwiperCards),
  { ssr: false }
)

const MovieDetail = dynamic(() => import("@/components/movie-detail").then((m) => m.MovieDetail), { ssr: false })

export default function FavoritesPage() {
  const { favorites, selectedMovie, exportFavoritesBackup } = useMovies()

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon" className="rounded-xl">
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Favorites</h1>
              <p className="text-xs text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "title" : "titles"} saved
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={exportFavoritesBackup}
            className="rounded-xl"
          >
            Backup
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <SwiperCards movies={favorites} />
      </section>

      {selectedMovie && <MovieDetail />}
    </main>
  )
}
