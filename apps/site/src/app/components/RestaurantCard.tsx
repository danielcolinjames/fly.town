// 'use client'
import classNames from 'classnames'
import { Crown } from 'lucide-react'
import Link from 'next/link'
// import { motion } from 'framer-motion'
import Image from 'next/image'

type AccessLevel = {
  image: string
}

export const RestaurantCard = ({ restaurant, index }: { restaurant: any; index: number }) => {
  // Assuming `lowestTierImage` is the field for the lowest tier image URL
  // Define a more specific type for accessLevels
  const accessLevels: Record<string, AccessLevel> = restaurant.accessLevels || {}
  const accessLevelsArray = Object.values(accessLevels)
  const imageUrl = accessLevelsArray[accessLevelsArray.length - 1]?.image || ''

  return (
    <Link
      href={`/${restaurant.restaurant_id}`}
    >
      {/* <motion.div */}
      <div
        className={classNames(
          'flex flex-row gap-3 sm:gap-4 items-center justify-start hover:bg-[#040404] px-2 sm:px-2 py-2 duration-200 transition-all rounded-full',
          index === 0 ? 'bg-[#050502] border border-[#181818] hover:bg-black' : 'bg-[#0a0a0a] border-[#202020] border'
        )}
      // layoutId={`restaurant-card-${restaurant.restaurant_id}`}
      >
        {/* <motion.img */}
        <Image
          src={imageUrl}
          alt="Restaurant Image"
          width={56}
          height={56}
          className="w-auto min-w-10 tiny:min-w-14 sm:min-w-20 h-10 tiny:h-14 sm:h-20 object-cover rounded-full bg-black"
        />
        {/* <Image
          src={imageUrl}
          className="min-w-14 sm:min-w-20 h-14 sm:h-20 object-cover rounded-full bg-black"
        // layoutId={`membership-image-${imageUrl}`}
        /> */}
        <div className="flex flex-col items-start sm:items-start">
          <div className="flex items-center">
            <span className="text-white text-sm tiny:text-xl sm:text-3xl">
              <span className="text-gray-600 shown whitespace-nowrap">{index + 1}. </span>
              {/* <motion.span */}
              <span
              //  layoutId={`restaurant-name-${restaurant.restaurant_id}`} 
              //  transition={{ type: 'spring' }}
              >
                {restaurant.full_name}
                {/* </motion.span> */}
              </span>
            </span>
            {index === 0 && <Crown className="-mt-10 h-6 w-6 rotate-[24deg] text-brandYellow" />}
          </div>
          <p className="text-gray-400 text-sm tiny:text-base sm:text-lg">{restaurant.totalCheckins.toLocaleString()} check ins</p>
        </div>
        {/* </motion.div> */}
      </div>
    </Link>
  )
}
