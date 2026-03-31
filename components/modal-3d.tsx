"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { X } from "lucide-react"
import { useMovies } from "@/store/use-movies"
import { GoldShader } from "./gold-shader"
import { SwiperCards } from "./swiper-cards"

export function Modal3D() {
  const { favorites, isModalOpen, closeModal } = useMovies()

  if (!isModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-deep/95 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="relative w-[95vw] max-w-2xl h-[80vh] max-h-[700px] rounded-3xl overflow-hidden border border-border shadow-[0_0_40px_rgba(212,175,55,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Three.js Canvas background */}
        <div className="absolute inset-0">
          <Canvas
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 5], fov: 50 }}
          >
            <Suspense fallback={null}>
              <GoldShader />
            </Suspense>
          </Canvas>
        </div>

        {/* Dark overlay for content readability */}
        <div className="absolute inset-0 bg-black-deep/60" />

        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="absolute top-6 left-6 z-10">
          <h2 className="text-2xl font-bold text-foreground">My Favorites</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? "movie" : "movies"} in collection
          </p>
        </div>

        {/* Swiper content */}
        <div className="absolute inset-0 flex items-center justify-center pt-20 pb-8 z-10">
          <SwiperCards movies={favorites} />
        </div>
      </div>
    </div>
  )
}
