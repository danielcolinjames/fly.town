// 'use client'
import Link from 'next/link'
// import { motion } from 'framer-motion'

export const RestaurantTitleSection = ({
  restaurantName,
  restaurantId,
  subtitle,
  location,
  highestValueKeyAccent,
}: {
  restaurantName: string
  restaurantId: string
  subtitle: string
  location: string
  highestValueKeyAccent: string
}) => {
  return (
    <div className="flex flex-col gap-4 pb-4 sm:pb-8 max-w-3xl mx-auto px-8">
      <Link
        href="/"
        className="block text-sm sm:text-base duration-150 transition-all py-4 w-auto hover:opacity-50"
        style={{ color: highestValueKeyAccent }}
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
      {/* <div className='w-full h-1 rounded-full' style={{ backgroundColor: highestValueKeyAccent }} /> */}
      <div className="flex flex-col justify-center gap-1 rounded-full pb-4 sm:pb-8">
        <p className="text-left text-xl text-gray-400 sm:text-2xl">{location}</p>
        <p className="text-left text-xl text-gray-600 sm:text-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
