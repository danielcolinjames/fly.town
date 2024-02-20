import classNames from 'classnames'
import { Crown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Restaurant } from './RestaurantCardsContainer'

export type AccessLevel = {
  image: string
  accent: string
  imageArtist: string
  count: number
  whiteText: boolean
}

export const RestaurantCard = ({ restaurant, index, subtitle }: { restaurant: Restaurant; index: number, subtitle?: string }) => {
  const accessLevels: Record<string, AccessLevel> = restaurant.accessLevels || {}
  const accessLevelsArray = Object.values(accessLevels)
  const imageUrl = accessLevelsArray[accessLevelsArray.length - 1]?.image
  const accentColor = accessLevelsArray[accessLevelsArray.length - 1]?.accent

  return (
    <Link href={`/${restaurant.restaurantId}`}>
      {/* <motion.div */}
      <div
        style={index === 0 ? { backgroundColor: `${accentColor}04` } : {}}
        className={classNames(
          'flex flex-row gap-3 sm:gap-4 items-center justify-start hover:bg-[#040404] px-2 sm:px-2 py-2 duration-200 transition-all rounded-full',
          index === 0 ? 'bg-[#050502] border border-[#181818] hover:bg-black' : 'bg-[#0a0a0a] border border-[#202020]',
        )}
      // style={{ borderColor: `${accentColor}24` }}
      // layoutId={`restaurant-card-${restaurant.restaurantId}`}
      >
        {/* <motion.img */}
        <Image
          src={imageUrl}
          alt="Restaurant Image"
          style={{ borderRadius: '50%', borderColor: accentColor }}
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
              <span style={{ color: accentColor }} className="whitespace-nowrap">{index + 1}. </span>
              {/* <motion.span */}
              <span
              //  layoutId={`restaurant-name-${restaurant.restaurantId}`}
              //  transition={{ type: 'spring' }}
              >
                {restaurant.restaurantName}
                {/* </motion.span> */}
              </span>
            </span>
            {index === 0 && <Crown className="-mt-10 h-6 w-6 rotate-[24deg] text-brandYellow" />}
          </div>
          <p className="text-gray-400 text-sm tiny:text-base sm:text-lg">
            {subtitle ? subtitle : `${restaurant?.totalCheckins?.toLocaleString()} check ins`}
          </p>
        </div>
        {/* </motion.div> */}
      </div>
    </Link>
  )
}
