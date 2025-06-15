"use client"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface PlatformFeature {
  title: string
  description: string
}

interface Platform {
  id: string
  name: string
  description: string
  image?: string
  imageSlides?: string[]
  video?: string
  features: PlatformFeature[]
  animationType?: "scroll" | "slideshow" | "video"
}

interface MobilePlatformCarouselProps {
  platforms: Platform[]
  currentPlatform: number
  onPlatformChange: (index: number) => void
}

const AnimatedScrollingImage = ({
  imageSrc,
  isActive,
  isTouched,
}: { imageSrc: string; isActive: boolean; isTouched: boolean }) => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: `url(${imageSrc})`, height: "200%", width: "100%", backgroundPosition: "top" }}
      initial={{ y: 0 }}
      animate={isActive && isTouched ? { y: [0, "-50%"] } : { y: 0 }}
      transition={
        isActive && isTouched
          ? { duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", ease: "linear" }
          : { duration: 0.5, ease: "easeOut" }
      }
    />
  </div>
)

const MobileImageSlideshow = ({ images, isActive }: { images: string[]; isActive: boolean }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  useEffect(() => {
    if (!isActive || !images || images.length <= 1) return
    const nextIndex = (currentImageIndex + 1) % images.length
    const img = new Image()
    img.src = images[nextIndex]
  }, [currentImageIndex, isActive, images])
  useEffect(() => {
    if (!isActive || !images || images.length <= 1) return
    const interval = setInterval(() => setCurrentImageIndex((prev) => (prev + 1) % images.length), 3000)
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

const MobileVideoPlayer = ({
  videoSrc,
  isActive,
  isSectionActive,
}: { videoSrc: string; isActive: boolean; isSectionActive: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive && isSectionActive) video.play().catch(console.error)
    else {
      video.pause()
      video.currentTime = 0
    }
  }, [isActive, isSectionActive, videoSrc])
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

export default function MobilePlatformCarousel({
  platforms,
  currentPlatform,
  onPlatformChange,
}: MobilePlatformCarouselProps) {
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && platforms.length > 0) {
      const containerWidth = containerRef.current.offsetWidth
      const totalWidth = platforms.length * containerWidth
      setDragConstraints({ left: -(totalWidth - containerWidth), right: 0 })
    }
  }, [platforms])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (currentPlatform < 0 || platforms.length === 0) return
    const threshold = 50
    const velocity = info.velocity.x
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 && velocity >= 0)
        onPlatformChange(currentPlatform === 0 ? platforms.length - 1 : currentPlatform - 1)
      else if (info.offset.x < 0 && velocity <= 0) onPlatformChange((currentPlatform + 1) % platforms.length)
    }
  }

  const calculateOffset = () => {
    if (!containerRef.current || platforms.length === 0 || currentPlatform < 0) return 0
    const containerWidth = containerRef.current.offsetWidth
    return -currentPlatform * containerWidth
  }

  if (platforms.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-foreground">Loading platforms...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden carousel-container">
      <motion.div
        className="flex w-full"
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        initial={{ x: calculateOffset() }}
        animate={{ x: calculateOffset() }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {platforms.map((platform, index) => (
          <div
            key={platform.id}
            className="w-full flex-shrink-0 px-4"
            style={{ width: containerRef.current?.offsetWidth || "100%" }}
          >
            <div
              className={`platform-card-modern rounded-2xl overflow-hidden relative ${index === currentPlatform ? "active-platform-card" : ""}`}
              style={{ height: "600px", opacity: index === currentPlatform ? 1 : 0.6 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: index === currentPlatform ? "#141823" : "rgba(20, 24, 35, 0.4)" }}
              />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-full relative mobile-image-container-7-4">
                  {platform.video ? (
                    <MobileVideoPlayer
                      videoSrc={platform.video}
                      isActive={index === currentPlatform}
                      isSectionActive={true}
                    />
                  ) : platform.animationType === "scroll" && platform.image ? (
                    <AnimatedScrollingImage
                      imageSrc={platform.image}
                      isActive={index === currentPlatform}
                      isTouched={false}
                    />
                  ) : platform.imageSlides && platform.imageSlides.length > 0 ? (
                    <MobileImageSlideshow images={platform.imageSlides} isActive={index === currentPlatform} />
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
                <div className="w-full p-3 flex flex-col justify-between mobile-features-container">
                  <div className="space-y-0 flex flex-row flex-wrap">
                    {platform.features.slice(0, 2).map((feature, i) => (
                      <div key={i} className="group w-1/2 px-2">
                        <div className="flex items-start gap-2 py-2">
                          <div className="feature-icon-container-mobile">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold mb-1 text-white/90">{feature.title}</h4>
                            <p className="text-xs text-white/70 leading-tight">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {index === currentPlatform && (
                    <div className="mt-2 px-2">
                      <Button
                        className="w-full flex items-center justify-center gap-3 px-5 py-6 h-[60px] bg-gradient-radial-primary hover:bg-gradient-radial-primary-hover text-white rounded-xl border-0 transition-all duration-300 relative overflow-hidden group"
                        size="sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                        <span className="text-[15px] font-medium relative z-10">Explore {platform.name}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
