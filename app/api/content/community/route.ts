import { NextResponse } from "next/server"
import { loadJsonContent } from "@/lib/content-loader"

interface NewsArticle {
  id: number
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  readTime: string
  image?: string
}
interface InstagramPost {
  id: number
  image?: string
  caption: string
  likes: number
  comments: number
  timestamp: string
  link: string
  avatar?: string
  authorHandle?: string
}
interface Tweet {
  id: number
  author: string
  handle: string
  avatar?: string
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
  verified?: boolean
}
interface CommunityContent {
  badgeText: string
  title: string
  subtitle: string
  tabs: Array<{ id: string; label: string; iconName: string }>
  newsFeed: { buttonText: string; buttonLink: string; articles: NewsArticle[] }
  instagramFeed: { buttonText: string; buttonLink: string; posts: InstagramPost[] }
  twitterFeed: { buttonText: string; buttonLink: string; tweets: Tweet[] }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const data = await loadJsonContent<CommunityContent>(`community-${lang}.json`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error fetching community content:", error)
    return NextResponse.json({ error: "Failed to load community content" }, { status: 500 })
  }
}
