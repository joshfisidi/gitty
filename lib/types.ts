export type Movie = {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  overview: string
  release_date: string
  genre_ids?: number[]
  media_type?: "movie" | "tv"
}

export type MovieDetails = Movie & {
  runtime: number
  genres: { id: number; name: string }[]
  tagline: string
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
    crew: { id: number; name: string; job: string }[]
  }
  videos?: {
    results: { key: string; site: string; type: string }[]
  }
}
