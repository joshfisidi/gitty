"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Movie } from "@/lib/types"

type MovieStore = {
  favorites: Movie[]
  selectedMovie: Movie | null
  isModalOpen: boolean
  addFavorite: (movie: Movie) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
  setSelectedMovie: (movie: Movie | null) => void
  openModal: () => void
  closeModal: () => void
  exportFavoritesBackup: () => void
  importFavoritesBackup: (file: File) => Promise<void>
}

export const useMovies = create<MovieStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      selectedMovie: null,
      isModalOpen: false,

      addFavorite: (movie) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === movie.id)
            ? state.favorites
            : [...state.favorites, movie],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      setSelectedMovie: (movie) => set({ selectedMovie: movie }),

      openModal: () => set({ isModalOpen: true }),

      closeModal: () => set({ isModalOpen: false, selectedMovie: null }),

      exportFavoritesBackup: () => {
        const payload = {
          app: "flickle",
          version: 1,
          exportedAt: new Date().toISOString(),
          favorites: get().favorites,
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `flickle-favorites-backup-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importFavoritesBackup: async (file: File) => {
        const text = await file.text()
        const parsed = JSON.parse(text)
        const next = Array.isArray(parsed?.favorites) ? parsed.favorites : []
        set({ favorites: next })
      },
    }),
    {
      name: "movie-favorites",
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)
