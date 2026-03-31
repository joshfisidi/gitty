"use client"

import { type ChangeEvent, useRef } from "react"
import Link from "next/link"
import { Download, Heart, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMovies } from "@/store/use-movies"

export function FavoritesButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    favorites,
    exportFavoritesBackup,
    importFavoritesBackup,
  } = useMovies()

  const onPickBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await importFavoritesBackup(file)
    e.currentTarget.value = ""
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        className="relative rounded-2xl bg-card border border-border px-6 hover:border-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
        variant="outline"
      >
        <Link href="/favorites" id="favorites-cta">
          <Heart className="h-5 w-5 mr-2 text-primary" />
          <span className="text-foreground">Favorites</span>
          {favorites.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {favorites.length}
            </span>
          )}
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Backup favorites to iCloud Files"
        onClick={exportFavoritesBackup}
        className="rounded-xl"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        title="Restore favorites backup"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl"
      >
        <Upload className="h-4 w-4" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onPickBackup}
      />
    </div>
  )
}
