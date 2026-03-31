import { NextResponse, type NextRequest } from "next/server"

function mapToMovieShape(item: any, mediaType: "movie" | "tv") {
  return {
    id: item.id,
    title: item.title || item.name || "Untitled",
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    vote_average: item.vote_average || 0,
    overview: item.overview || "",
    release_date: item.release_date || item.first_air_date || "",
    genre_ids: item.genre_ids || [],
    media_type: mediaType,
  }
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get("page") || "1"
  const category = (searchParams.get("category") || "movies").toLowerCase()

  if (!apiKey) {
    return NextResponse.json({ error: "TMDb API key not configured" }, { status: 500 })
  }

  let endpoint = ""

  switch (category) {
    case "tv":
      endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc&page=${page}&vote_count.gte=50`
      break
    case "animation":
      endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${page}&with_genres=16&vote_count.gte=50`
      break
    case "anime":
      endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc&page=${page}&with_genres=16&with_origin_country=JP&vote_count.gte=20`
      break
    case "movies":
    default:
      endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${page}&vote_count.gte=100`
      break
  }

  try {
    const res = await fetch(endpoint)

    if (!res.ok) {
      throw new Error(`Failed to fetch trending ${category}`)
    }

    const data = await res.json()
    const mediaType = category === "tv" || category === "anime" ? "tv" : "movie"
    const normalized = Array.isArray(data.results)
      ? data.results.map((item: any) => mapToMovieShape(item, mediaType))
      : []
    return NextResponse.json(normalized)
  } catch (error) {
    console.error("TMDb trending error:", error)
    return NextResponse.json({ error: "Failed to fetch trending content" }, { status: 500 })
  }
}
