"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import MobilePlatformCarousel from "@/components/mobile-platform-carousel"
import { RenderIcon } from "@/components/icon-mapper"
import { useLanguage } from "@/contexts/language-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface PlatformFeature {
  title: string
  description: string
}
interface PlatformData {
  id: string
  name: string
  description: string
  image?: string
  imageSlides?: string[]
  video?: string
  features: PlatformFeature[]
  animationType?: "scroll" | "slideshow" | "video"
}
interface PlatformsContent {
  sectionBadge: string
  platforms: PlatformData[]
}

const AnimatedScrollingImage = ({
  imageSrc,
  isActive,
  isHovered,
}: { imageSrc: string; isActive: boolean; isHovered: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: `url(${imageSrc})`,
          height: isActive ? "200%" : "100%",
          width: "100%",
          backgroundPosition: "top",
        }}
        initial={{ y: 0 }}
        animate={isActive && isHovered ? { y: [0, "-50%"] } : { y: 0 }}
        transition={
          isActive && isHovered
            ? { duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", ease: "linear" }
            : { duration: 0.5, ease: "easeOut" }
        }
      />
    </div>
  )
}

const ImageSlideshow = ({ images, isActive }: { images: string[]; isActive: boolean }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!isActive || !images || images.length <= 1) return
    const nextIndex = (currentImageIndex + 1) % images.length
    const nextImageSrc = images[nextIndex]
    if (nextImageSrc) {
      const preloader = new Image()
      preloader.src = nextImageSrc
    }
  }, [currentImageIndex, isActive, images])

  useEffect(() => {
    if (!isActive || !images || images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isActive, images])

  if (!images || images.length === 0)
    return (
      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
        <p className="text-white/50">No slides</p>
      </div>
    )

  return (
    <div className="absolute inset-0">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        />
      </AnimatePresence>
    </div>
  )
}

const VideoPlayer = ({
  videoSrc,
  isActive,
  isSectionVisible,
}: { videoSrc: string; isActive: boolean; isSectionVisible: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive && isSectionVisible) {
      video.play().catch((error) => console.log("Video autoplay failed:", error))
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive, isSectionVisible, videoSrc])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        loop
        muted
        playsInline
        preload="metadata"
      />
    </div>
  )
}

export default function PlatformCarousel() {
  const { language, t } = useLanguage()
  const [content, setContent] = useState<PlatformsContent | null>(null)
  const [currentPlatform, setCurrentPlatform] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredPlatform, setHoveredPlatform] = useState<number | null>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Fetch data when language changes
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/platforms?lang=${language}`)
        if (!response.ok) throw new Error(`Failed to fetch platforms content: ${response.statusText}`)
        const data = await response.json()
        console.log("Fetched platforms content:", data)
        setContent(data)
      } catch (error) {
        console.error("Error fetching platforms content:", error)
        setContent({ sectionBadge: language === "es" ? "Nuestras Plataformas" : "Our Platforms", platforms: [] })
      }
    }
    fetchContent()
  }, [language])

  const platforms = content?.platforms || []

  const nextPlatform = () => {
    if (isAnimating || platforms.length === 0) return
    setIsAnimating(true)
    const nextIndex = (currentPlatform + 1) % platforms.length
    setCurrentPlatform(nextIndex)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const prevPlatform = () => {
    if (isAnimating || platforms.length === 0) return
    setIsAnimating(true)
    const prevIndex = currentPlatform === 0 ? platforms.length - 1 : currentPlatform - 1
    setCurrentPlatform(prevIndex)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const goToPlatform = (index: number) => {
    if (isAnimating || platforms.length === 0 || index < 0 || index >= platforms.length) return
    setIsAnimating(true)
    setCurrentPlatform(index)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const handlePlatformMouseEnter = (index: number) => setHoveredPlatform(index)
  const handlePlatformMouseLeave = () => setHoveredPlatform(null)

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  }

  const itemWidth = "70vw"
  const calculateOffset = (index: number) => {
    if (platforms.length === 0) return "0px"
    const centerOffset = `calc(50vw - ${itemWidth} / 2)`
    const itemOffset = `calc(${index} * -${itemWidth})`
    return `calc(${centerOffset} + ${itemOffset})`
  }

  if (!content) {
    return (
      <section
        id="platforms"
        className="relative pt-36 pb-20 h-[700px] flex items-center justify-center bg-muted/50 dark:bg-muted/10"
      >
        <p className="text-foreground">{t("loading")}</p>
      </section>
    )
  }

  if (platforms.length === 0) {
    return (
      <section
        id="platforms"
        className="relative pt-36 pb-20 h-[700px] flex items-center justify-center bg-muted/50 dark:bg-muted/10"
      >
        <p className="text-foreground">{t("noData")}</p>
      </section>
    )
  }

  const currentDisplayPlatform = platforms[currentPlatform]

  return (
    <section
      ref={sectionRef}
      className="relative pt-36 pb-20 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0E2035 0%, #0A1727 100%)" }}
      id="platforms"
      aria-labelledby="platforms-heading"
    >
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0A1727 0%, transparent 100%)", zIndex: 60 }}
      />
      <div className="relative z-10">
        <div className="container px-4 md:px-6 mb-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              {content.sectionBadge}
            </div>
          </div>
        </div>

        <div className="container px-4 md:px-6 mb-12">
          <div className="text-center space-y-6 min-h-[120px] md:min-h-[150px]">
            {currentDisplayPlatform ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlatform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <h2 id="platforms-heading" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    {currentDisplayPlatform.name}
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl h-12 md:h-14 flex items-center justify-center">
                    {currentDisplayPlatform.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="space-y-4">
                <h2 id="platforms-heading" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("loading")}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl h-12 md:h-14 flex items-center justify-center">
                  {t("loading")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full mb-8">
          <div className="hidden md:block">
            {/* Gradient overlays */}

            {/* Navigation Buttons */}
            {platforms.length > 0 && (
              <>
                <Button
                  onClick={prevPlatform}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 p-0 bg-background/80 backdrop-blur-sm border border-white/10 hover:bg-background/90 shadow-lg"
                  disabled={isAnimating}
                  aria-label="Previous platform"
                >
                  <RenderIcon iconName="ChevronLeft" className="h-6 w-6" />
                </Button>
                <Button
                  onClick={nextPlatform}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full w-12 h-12 p-0 bg-background/80 backdrop-blur-sm border border-white/10 hover:bg-background/90 shadow-lg"
                  disabled={isAnimating}
                  aria-label="Next platform"
                >
                  <RenderIcon iconName="ChevronRight" className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="carousel-container w-full">
              <motion.div
                ref={motionRef}
                className="flex items-center"
                initial={{ x: calculateOffset(0) }}
                animate={{ x: calculateOffset(currentPlatform) }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {platforms.map((platform, index) => {
                  const isActive = index === currentPlatform
                  const isHovered = hoveredPlatform === index
                  return (
                    <div key={platform.id} className="flex-shrink-0 px-4" style={{ width: itemWidth }}>
                      <div
                        className="relative rounded-2xl transition-all duration-700 ease-out"
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 8px 25px rgba(104, 219, 255, 0.4)) drop-shadow(0 4px 15px rgba(104, 219, 255, 0.3))"
                            : undefined,
                        }}
                      >
                        <div
                          className={cn(
                            "relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out",
                            isActive
                              ? "scale-100 opacity-100 shadow-2xl"
                              : "scale-90 opacity-60 hover:opacity-80 hover:scale-95",
                          )}
                          onClick={() => goToPlatform(index)}
                          onMouseEnter={() => handlePlatformMouseEnter(index)}
                          onMouseLeave={handlePlatformMouseLeave}
                        >
                          <div
                            style={{ border: isActive ? "2px solid #68DBFF" : "1px solid #315F8C" }}
                            className="platform-card-modern rounded-2xl overflow-hidden relative platform-card-adaptive-height"
                          >
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{ backgroundColor: "#0A1727" }}
                            />
                            <div className="relative z-10 h-full">
                              <div className="grid grid-rows-[1fr_1fr] xl:grid-rows-1 xl:grid-cols-[3fr_1fr] h-full">
                                <div className="w-full relative image-container-adaptive">
                                  {platform.video ? (
                                    <VideoPlayer
                                      videoSrc={platform.video}
                                      isActive={isActive}
                                      isSectionVisible={true}
                                    />
                                  ) : platform.animationType === "scroll" && platform.image ? (
                                    <AnimatedScrollingImage
                                      imageSrc={platform.image}
                                      isActive={isActive}
                                      isHovered={isHovered}
                                    />
                                  ) : platform.imageSlides && platform.imageSlides.length > 0 ? (
                                    <ImageSlideshow images={platform.imageSlides} isActive={isActive} />
                                  ) : platform.image ? (
                                    <div
                                      className="absolute inset-0 bg-cover bg-center"
                                      style={{ backgroundImage: `url(${platform.image})` }}
                                    />
                                  ) : (
                                    <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                                      <p className="text-white/50">No image</p>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full p-2 md:p-4 features-container-grid">
                                  {isActive && (
                                    <div className="features-area">
                                      <div className="space-y-0 xl:space-y-0 flex flex-row xl:flex-col flex-wrap">
                                        <AnimatePresence mode="wait">
                                          {platform.features.map((feature, i) => (
                                            <motion.div
                                              key={`${platform.id}-feature-${i}`}
                                              custom={i}
                                              initial="hidden"
                                              animate="visible"
                                              exit="hidden"
                                              variants={featureVariants}
                                              className="group xl:w-full w-1/2 px-2"
                                            >
                                              <div className="flex items-start gap-3 py-3">
                                                <div className="feature-icon-container">
                                                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse" />
                                                </div>
                                                <div className="flex-1">
                                                  <h4 className="text-sm font-semibold mb-1 text-white/90">
                                                    {feature.title}
                                                  </h4>
                                                  <p className="text-white/70 text-xs leading-relaxed">
                                                    {feature.description}
                                                  </p>
                                                </div>
                                              </div>
                                              {i < platform.features.length - 1 && (
                                                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />
                                              )}
                                            </motion.div>
                                          ))}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  )}
                                  {isActive && (
                                    <div className="button-area">
                                      <Button className="w-full flex items-center justify-center gap-3 px-5 py-6 h-[60px] bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 transition-all duration-300 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                                        <span className="text-[15px] font-medium relative z-10">
                                          {language === "es" ? "Explorar" : "Explore"} {platform.name}
                                        </span>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </div>
          </div>

          {/* Mobile version */}
          <div className="md:hidden">
            {platforms.length > 0 ? (
              <MobilePlatformCarousel
                platforms={platforms}
                currentPlatform={currentPlatform}
                onPlatformChange={goToPlatform}
              />
            ) : (
              <div className="h-[600px] flex items-center justify-center">
                <p className="text-foreground">{t("loading")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Indicators */}
        {platforms.length > 0 && (
          <div className="container px-4 md:px-6">
            <div className="flex justify-center mt-8 space-x-2">
              {platforms.map((platform, i) => (
                <button
                  key={platform.id}
                  onClick={() => goToPlatform(i)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300 ease-out",
                    i === currentPlatform ? "bg-primary w-8" : "bg-primary/30 hover:bg-primary/50",
                  )}
                  aria-label={`Go to ${platform.name}`}
                  aria-current={i === currentPlatform ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
