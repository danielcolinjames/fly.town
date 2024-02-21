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

export const RestaurantCard = ({ hideCrown, restaurant, index, subtitle }: { hideCrown?: boolean, restaurant: Restaurant; index: number, subtitle?: string }) => {
  const accessLevels: Record<string, AccessLevel> = restaurant.accessLevels || {}
  const accessLevelsArray = Object.values(accessLevels)
  const imageUrl = accessLevelsArray[accessLevelsArray.length - 1]?.image
  const accentColor = accessLevelsArray[accessLevelsArray.length - 1]?.accent

  return (
    <Link href={`/${restaurant.restaurantId}`}>
      {/* <motion.div */}
      <div
        style={index === 0 ? {
          // boxShadow: `0 0 100px ${accentColor}12`,
          // borderColor: `${accentColor}40`
        } : {}}
        className={classNames(
          'flex flex-row bg-[#070707] hover:bg-[#040404] duration-200 transition-all rounded-full w-full border border-[#202020]',
          // index === 0 ? 'bg-[#050502] border-[#202020]' : 'bg-[#0a0a0a] border-[#202020]',
        )}
      // style={{ borderColor: `${accentColor}24` }}
      // layoutId={`restaurant-card-${restaurant.restaurantId}`}
      >
        <div className='w-full flex flex-row items-center justify-start gap-3 sm:gap-4 px-2 sm:px-2 py-2 rounded-full'
        // style={index === 0 ? { boxShadow: `0 0 15px ${accentColor}25` } : {}}
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
              {index === 0 && !hideCrown && <Crown className="z-10 -mt-10 sm:-mt-14 size-6 sm:size-8 rotate-[24deg] text-brandYellow" />}
            </div>
            <p className="text-gray-400 text-sm tiny:text-base sm:text-lg">
              {subtitle ? subtitle : `${restaurant?.totalCheckins?.toLocaleString()} check ins`}
            </p>
          </div>
          {/* </motion.div> */}
        </div>
      </div>
    </Link>
  )
}
