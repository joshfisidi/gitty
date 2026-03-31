import { NextResponse } from "next/server"

type TmdbItem = {
  id: number
  media_type?: "movie" | "tv" | "person"
  title?: string
  name?: string
  overview?: string
  release_date?: string
  first_air_date?: string
  poster_path?: string | null
  backdrop_path?: string | null
  vote_average?: number
  vote_count?: number
  popularity?: number
  genre_ids?: number[]
}

function normalize(item: TmdbItem) {
  const media = item.media_type === "tv" ? "tv" : "movie"
  return {
    id: item.id,
    media_type: media,
    title: item.title || item.name || "Untitled",
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    vote_average: item.vote_average || 0,
    overview: item.overview || "",
    release_date: item.release_date || item.first_air_date || "",
    genre_ids: item.genre_ids || [],
  }
}

function semanticScore(query: string, item: ReturnType<typeof normalize>) {
  const q = query.toLowerCase().trim()
  const qTokens = q.split(/\s+/).filter(Boolean)
  const hay = `${item.title} ${item.overview}`.toLowerCase()

  let score = 0

  // exact phrase hit
  if (hay.includes(q)) score += 10

  // token overlap
  for (const tok of qTokens) {
    if (tok.length < 2) continue
    if (item.title.toLowerCase().includes(tok)) score += 3
    else if (hay.includes(tok)) score += 1
  }

  // quality/popularity priors
  score += Math.min(3, (item.vote_average || 0) / 3)

  return score
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "TMDb API key not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${apiKey}&include_adult=false`
    )

    if (!res.ok) {
      throw new Error("Failed to fetch from TMDb")
    }

    const data = await res.json()
    const raw: TmdbItem[] = Array.isArray(data.results) ? data.results : []

    const normalized = raw
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map(normalize)

    const ranked = normalized
      .map((item) => ({ ...item, __score: semanticScore(query, item) }))
      .sort((a, b) => b.__score - a.__score)
      .map(({ __score, ...rest }) => rest)

    return NextResponse.json(ranked)
  } catch (error) {
    console.error("TMDb search error:", error)
    return NextResponse.json({ error: "Failed to search content" }, { status: 500 })
  }
}
