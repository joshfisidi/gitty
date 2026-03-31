import { NextResponse, type NextRequest } from "next/server"

const LANGUAGE_BY_CATEGORY: Record<string, string> = {
  movies: "javascript",
  tv: "typescript",
  animation: "python",
  anime: "rust",
}

function mapRepo(item: any) {
  return {
    id: item.id,
    title: item.full_name,
    poster_path: item.owner?.avatar_url || null,
    backdrop_path: null,
    vote_average: Math.min(10, ((item.stargazers_count || 0) / 5000) * 10),
    overview: item.description || "",
    release_date: item.updated_at || item.created_at || "",
    media_type: "movie" as const,
    repo_url: item.html_url,
    homepage: item.homepage,
    language: item.language,
    stars: item.stargazers_count || 0,
    forks: item.forks_count || 0,
    issues: item.open_issues_count || 0,
    owner_url: item.owner?.html_url || null,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get("page") || "1"
  const category = (searchParams.get("category") || "movies").toLowerCase()
  const language = LANGUAGE_BY_CATEGORY[category] || "javascript"

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""

  const q = `language:${language} stars:>100 pushed:>2025-01-01`
  const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=20&page=${page}`

  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`GitHub trending fetch failed: ${res.status}`)
    }

    const data = await res.json()
    const items = Array.isArray(data.items) ? data.items : []
    return NextResponse.json(items.map(mapRepo))
  } catch (error) {
    console.error("GitHub trending error:", error)
    return NextResponse.json({ error: "Failed to fetch trending repositories" }, { status: 500 })
  }
}
