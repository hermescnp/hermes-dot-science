"use client"

import type React from "react"
import { motion } from "framer-motion"

interface PlatformCarouselProps {
  features: string[]
  platformName: string
  onExploreClick: () => void
}

const PlatformCarousel: React.FC<PlatformCarouselProps> = ({ features, platformName, onExploreClick }) => {
  return (
    <div className="w-full flex flex-col md:flex-row">
      <div className="w-full xl:w-3/4 p-4">
        <h2 className="text-2xl font-bold mb-4">{platformName}</h2>
        <p className="text-gray-700">
          {/* Add a description or any other relevant information about the platform here */}
          This is a brief description of the {platformName} platform. You can highlight its key features and benefits.
        </p>
      </div>

      <div className="w-full xl:w-1/4 p-2 md:p-4 flex flex-col h-full features-container-adaptive">
        <div className="relative overflow-hidden flex-1 min-h-0">
          <div className="overflow-y-auto scrollbar-hide h-full">
            <ul>
              {features.map((feature, index) => (
                <li key={index} className="mb-2">
                  - {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <motion.div className="px-2 xl:px-0 pt-4" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            onClick={onExploreClick}
          >
            Explore {platformName}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default PlatformCarousel
