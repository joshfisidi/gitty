"use client"

import { X, Heart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { StarRating } from "./star-rating"
import { useMovies } from "@/store/use-movies"

export function MovieDetail() {
  const { selectedMovie, isModalOpen, closeModal, addFavorite, removeFavorite, isFavorite } = useMovies()

  if (!selectedMovie) return null

  const isInFavorites = isFavorite(selectedMovie.id)

  const toggleFavorite = () => {
    if (isInFavorites) {
      removeFavorite(selectedMovie.id)
    } else {
      addFavorite(selectedMovie)
    }
  }

  return (
    <Drawer
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}
      dismissible
      handleOnly={false}
    >
      <DrawerContent className="h-screen max-h-screen mt-0 rounded-none border-0 bg-card">
        <div className="relative w-full max-w-4xl mx-auto overflow-y-auto">
          {/* Backdrop image */}
          {selectedMovie.backdrop_path && (
            <div className="relative h-56 md:h-72 overflow-hidden">
              <img
                src={selectedMovie.backdrop_path}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black-deep/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
            aria-label="Close details"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="relative p-6 md:p-8 -mt-16">
            <div className="flex flex-col gap-6">
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {selectedMovie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
                  {selectedMovie.release_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedMovie.release_date.split("-")[0]}</span>
                    </div>
                  )}
                </div>

                {selectedMovie.vote_average > 0 && (
                  <div className="mb-4">
                    <StarRating rating={selectedMovie.vote_average} size="lg" />
                  </div>
                )}

                {selectedMovie.overview && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {selectedMovie.overview}
                  </p>
                )}

                <Button
                  onClick={toggleFavorite}
                  className={`rounded-xl px-6 ${
                    isInFavorites
                      ? "bg-primary text-primary-foreground hover:bg-accent"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 ${isInFavorites ? "fill-current" : ""}`}
                  />
                  {isInFavorites ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
