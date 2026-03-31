import { NextResponse } from "next/server"

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""

  try {
    const q = `${query} in:name,description stars:>10`
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=20`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    )

    if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`)

    const data = await res.json()
    const items = Array.isArray(data.items) ? data.items : []
    return NextResponse.json(items.map(mapRepo))
  } catch (error) {
    console.error("GitHub search error:", error)
    return NextResponse.json({ error: "Failed to search repositories" }, { status: 500 })
  }
}
