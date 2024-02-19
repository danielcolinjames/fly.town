// 'use client'
import Link from 'next/link'
// import { motion } from 'framer-motion'

export const RestaurantTitleSection = ({
  restaurantName,
  restaurantId,
  checkinCount,
}: {
  restaurantName: string
  restaurantId: string
  checkinCount: number
}) => {
  return (
    <div className="flex flex-col gap-2 pb-10 sm:pb-8 max-w-3xl mx-auto px-8">
      <Link
        href="/"
        className="block text-gray-600 text-sm sm:text-base hover:text-brandYellow duration-150 transition-all py-4 w-auto"
      >
        &larr; Top 10
      </Link>
      {/* <motion.span */}
      <span
        // layoutId={`restaurant-name-${restaurantId}`}
        className="text-left text-5xl text-white sm:text-7xl"
      >
        {restaurantName}
        {/* </motion.span> */}
      </span>
      <div className="flex flex-col justify-center gap-0">
        <p className="text-left text-xl text-gray-600 sm:text-2xl">
          {checkinCount.toLocaleString()} lifetime check ins
        </p>
      </div>
    </div>
  )
}
