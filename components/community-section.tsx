"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import FrostedGlassIcon from "@/components/frosted-glass-icon"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"

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

const NewsFeed = ({ articles, buttonText, buttonLink }: CommunityContent["newsFeed"]) => {
  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card
            className="hover:shadow-lg transition-all duration-300 border-[#68DBFF]/20 bg-[#0A1727] backdrop-blur-sm cursor-pointer hover:border-[#68DBFF] hover:border-[0.5px] hover:drop-shadow-[0_0_10px_rgba(104,219,255,0.5)] hover:bg-[#0A1727]"
            onClick={() =>
              window.open(
                article.image ? buttonLink : "https://www.linkedin.com/company/hermes-dot-science/",
                "_blank",
                "noopener,noreferrer",
              )
            } // Fallback link if no specific article link
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2">{article.title}</h3>
                <div className="w-full">
                  <img
                    src={article.image || "/placeholder.svg?height=200&width=350&query=news+article"}
                    alt={article.title}
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RenderIcon iconName="UserIconLucide" className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RenderIcon iconName="Calendar" className="w-3 h-3" />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <Button
        variant="outline"
        className="w-full mt-4 h-12 border-[#0A5E95] border-[0.5px] hover:bg-black/30 transition-colors"
        onClick={() => window.open(buttonLink, "_blank", "noopener,noreferrer")}
      >
        <RenderIcon iconName="ExternalLink" className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

const InstagramFeed = ({ posts, buttonText, buttonLink }: CommunityContent["instagramFeed"]) => {
  const handlePostClick = (link: string) => window.open(link, "_blank", "noopener,noreferrer")
  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card
            className="hover:shadow-lg transition-all duration-300 border-[#68DBFF]/20 bg-[#0A1727] backdrop-blur-sm cursor-pointer hover:border-[#68DBFF] hover:border-[0.5px] hover:drop-shadow-[0_0_10px_rgba(104,219,255,0.5)] hover:bg-[#0A1727]"
            onClick={() => handlePostClick(post.link)}
          >
            <CardContent className="p-0">
              {" "}
              {/* Reverted to p-0 */}
              <div className="space-y-3">
                {/* Header section with margins */}
                <div className="flex items-center gap-3 p-4 pb-0">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.avatar || "/images/hermes-logo-icon.svg"} />
                    <AvatarFallback>
                      {post.authorHandle ? post.authorHandle.substring(0, 2).toUpperCase() : "IG"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{post.authorHandle || "hermes.science"}</span>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Image - full width, no margins */}
                <img
                  src={post.image || "/placeholder.svg?height=300&width=300&query=instagram+post+image"}
                  alt="Instagram post"
                  className="w-full aspect-square object-cover"
                />

                {/* Footer section with margins */}
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm hover:text-red-500 transition-colors">
                      <RenderIcon iconName="Heart" className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors">
                      <RenderIcon iconName="MessageCircle" className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm hover:text-green-500 transition-colors">
                      <RenderIcon iconName="Share" className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.caption}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <Button
        variant="outline"
        className="w-full mt-4 h-12 border-[#0A5E95] border-[0.5px] hover:bg-black/30 transition-colors"
        onClick={() => window.open(buttonLink, "_blank", "noopener,noreferrer")}
      >
        <RenderIcon iconName="ExternalLink" className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

const TwitterFeed = ({ tweets, buttonText, buttonLink }: CommunityContent["twitterFeed"]) => {
  return (
    <div className="space-y-4">
      {tweets.map((tweet, index) => (
        <motion.div
          key={tweet.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card
            className="hover:shadow-lg transition-all duration-300 border-[#68DBFF]/20 bg-[#0A1727] backdrop-blur-sm cursor-pointer hover:border-[#68DBFF] hover:border-[0.5px] hover:drop-shadow-[0_0_10px_rgba(104,219,255,0.5)] hover:bg-[#0A1727]"
            onClick={() => window.open(buttonLink, "_blank", "noopener,noreferrer")}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={tweet.avatar || "/images/hermes-logo-icon.svg"} />
                    <AvatarFallback>{tweet.author ? tweet.author.substring(0, 2).toUpperCase() : "TW"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{tweet.author}</span>
                      {tweet.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">{tweet.handle}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{tweet.timestamp}</span>
                    </div>
                    <p className="text-sm mt-2 leading-relaxed">{tweet.content}</p>
                    <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <RenderIcon iconName="MessageCircle" className="w-4 h-4" />
                        <span>{tweet.replies}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <RenderIcon iconName="Repeat2" className="w-4 h-4" />
                        <span>{tweet.retweets}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <RenderIcon iconName="Heart" className="w-4 h-4" />
                        <span>{tweet.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <RenderIcon iconName="Share" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <Button
        variant="outline"
        className="w-full mt-4 h-12 border-[#0A5E95] border-[0.5px] hover:bg-black/30 transition-colors"
        onClick={() => window.open(buttonLink, "_blank", "noopener,noreferrer")}
      >
        <RenderIcon iconName="ExternalLink" className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState<"news" | "instagram" | "twitter">("news")
  const [content, setContent] = useState<CommunityContent | null>(null)
  const { language, t } = useLanguage()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/community?lang=${language}`)
        if (!response.ok) throw new Error("Failed to fetch community content")
        const data = await response.json()
        setContent(data)
      } catch (error) {
        console.error("Error fetching community content:", error)
        setContent({
          badgeText: "Community",
          title: "Stay Connected",
          subtitle: t("loading"),
          tabs: [
            { id: "news", label: "News Feed", iconName: "ExternalLink" },
            { id: "instagram", label: "Instagram", iconName: "Heart" },
            { id: "twitter", label: "X (Twitter)", iconName: "MessageCircle" },
          ],
          newsFeed: { buttonText: "View All News", buttonLink: "#", articles: [] },
          instagramFeed: { buttonText: "Follow on Instagram", buttonLink: "#", posts: [] },
          twitterFeed: { buttonText: "Follow on X", buttonLink: "#", tweets: [] },
        })
      }
    }
    fetchContent()
  }, [language, t])

  if (!content) {
    return (
      <section id="community" className="py-20 h-[600px] flex items-center justify-center">
        <p>{t("loading")}</p>
      </section>
    )
  }

  return (
    <section className="py-20" id="community" aria-labelledby="community-heading">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              {content.badgeText}
            </div>
            <h2 id="community-heading" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {content.title}
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{content.subtitle}</p>
          </div>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          <div>
            <Card className="mb-4 border-[#68DBFF]/30 bg-background/60 backdrop-blur-sm">
              <CardHeader className="py-3 border-b border-[#68DBFF]/20 flex justify-center">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FrostedGlassIcon
                    icon={<RenderIcon iconName="ExternalLink" className="w-5 h-5" />}
                    color="rgba(59, 130, 246, 0.5)"
                    size="sm"
                  />
                  {content.tabs.find((tab) => tab.id === "news")?.label}
                </CardTitle>
              </CardHeader>
            </Card>
            <NewsFeed {...content.newsFeed} />
          </div>
          <div>
            <Card className="mb-4 border-[#68DBFF]/30 bg-background/60 backdrop-blur-sm">
              <CardHeader className="py-3 border-b border-[#68DBFF]/20 flex justify-center">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FrostedGlassIcon
                    icon={<RenderIcon iconName="Heart" className="w-5 h-5" />}
                    color="rgba(236, 72, 153, 0.5)"
                    size="sm"
                  />
                  {content.tabs.find((tab) => tab.id === "instagram")?.label}
                </CardTitle>
              </CardHeader>
            </Card>
            <InstagramFeed {...content.instagramFeed} />
          </div>
          <div>
            <Card className="mb-4 border-[#68DBFF]/30 bg-background/60 backdrop-blur-sm">
              <CardHeader className="py-3 border-b border-[#68DBFF]/20 flex justify-center">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <FrostedGlassIcon
                    icon={<RenderIcon iconName="MessageCircle" className="w-5 h-5" />}
                    color="rgba(14, 165, 233, 0.5)"
                    size="sm"
                  />
                  {content.tabs.find((tab) => tab.id === "twitter")?.label}
                </CardTitle>
              </CardHeader>
            </Card>
            <TwitterFeed {...content.twitterFeed} />
          </div>
        </div>

        <div className="lg:hidden">
          <div className="flex justify-center mb-6">
            <div className="flex bg-background/60 backdrop-blur-sm rounded-lg p-1 border border-[#68DBFF]/20">
              {content.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                  style={activeTab === tab.id ? { backgroundColor: "#141823", border: "1px solid #68DBFF" } : {}}
                >
                  <FrostedGlassIcon
                    icon={<RenderIcon iconName={tab.iconName} className="w-4 h-4" />}
                    color={
                      activeTab === tab.id
                        ? "#68DBFF"
                        : tab.id === "news"
                          ? "rgba(59, 130, 246, 0.5)"
                          : tab.id === "instagram"
                            ? "rgba(236, 72, 153, 0.5)"
                            : "rgba(14, 165, 233, 0.5)"
                    }
                    size="sm"
                    className={`transition-all duration-200 ${activeTab === tab.id ? "scale-110 selected-tab-icon" : "scale-100"}`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "news" && <NewsFeed {...content.newsFeed} />}
            {activeTab === "instagram" && <InstagramFeed {...content.instagramFeed} />}
            {activeTab === "twitter" && <TwitterFeed {...content.twitterFeed} />}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
