import classNames from 'classnames'
import { Crown } from 'lucide-react'
import Link from 'next/link'

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
      className={classNames(
        'flex flex-row gap-3 sm:gap-4 items-center justify-start hover:bg-[#040404] px-4 sm:px-4 py-2 duration-200 transition-all rounded-full',
        index === 0 ? 'bg-[#050502] border border-[#181818] hover:bg-black' : 'bg-[#0a0a0a] border-[#202020] border p-1'
      )}
    >
      <img src={imageUrl} className="min-w-10 sm:min-w-20 h-10 sm:h-20 object-cover rounded-full bg-black" />
      <div className="flex flex-col items-start sm:items-start">
        <span className="hidden sm:flex text-gray-500 pr-2 sm:pr-3 flex-row">#{index + 1}</span>
        <div className="flex items-center">
          <span className="text-white text-xl sm:text-3xl">
            <span className="text-gray-600 shown sm:hidden whitespace-nowrap">{index + 1}. </span>
            {restaurant.full_name}
          </span>
          {index === 0 && <Crown className="-mt-10 h-6 w-6 rotate-[24deg] text-brandYellow" />}
        </div>
        <p className="text-gray-400 text-base sm:text-lg">{restaurant.totalCheckins.toLocaleString()} check ins</p>
      </div>
    </Link>
  )
}
