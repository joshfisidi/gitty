import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.TMDB_API_KEY
  const { searchParams } = new URL(req.url)
  const media = (searchParams.get("media") || "movie") as "movie" | "tv"

  if (!apiKey) {
    return NextResponse.json({ error: "TMDb API key not configured" }, { status: 500 })
  }

  try {
    const endpoint = media === "tv" ? "tv" : "movie"
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${apiKey}&append_to_response=credits,videos,watch/providers`
    )

    if (!res.ok) {
      throw new Error("Failed to fetch movie details")
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("TMDb movie details error:", error)
    return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 })
  }
}
