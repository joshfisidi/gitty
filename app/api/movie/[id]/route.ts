import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const repoId = id
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""

  try {
    const res = await fetch(`https://api.github.com/repositories/${repoId}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) throw new Error(`Repo details failed: ${res.status}`)
    const repo = await res.json()

    const links = [
      { provider_name: "Repo", url: repo.html_url },
      { provider_name: "Owner", url: repo.owner?.html_url },
      { provider_name: "Issues", url: `${repo.html_url}/issues` },
      ...(repo.homepage ? [{ provider_name: "Homepage", url: repo.homepage }] : []),
    ].filter((x) => !!x.url)

    return NextResponse.json({
      "watch/providers": {
        results: {
          CA: { flatrate: links },
          US: { flatrate: links },
        },
      },
    })
  } catch (error) {
    console.error("Repo details error:", error)
    return NextResponse.json({ error: "Failed to fetch repository details" }, { status: 500 })
  }
}
