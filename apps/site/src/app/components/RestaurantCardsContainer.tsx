import React from 'react'
import { AccessLevel, RestaurantCard } from './RestaurantCard'
import { formatDistanceToNow } from 'date-fns';

export type Restaurant = {
  restaurantId: string
  restaurantName: string
  accessLevels: Record<string, AccessLevel>
  totalCheckins: number
  firstCheckInDate?: string
}

interface RestaurantCardsContainerProps {
  restaurants: Restaurant[] | null
  title: string
  subtitle: string
}

export const RestaurantCardsContainer: React.FC<RestaurantCardsContainerProps> = ({ restaurants, title, subtitle }) => {
  return (
    <div className="flex flex-col justify-center gap-8 sm:gap-4 px-4 sm:px-0">
      {restaurants ? (
        <div className="flex flex-col justify-center gap-8 sm:gap-4">
          <div className="flex flex-col justify-center gap-1 sm:gap-1 max-w-sm sm:max-w-xl mx-auto w-full mt-6 sm:mt-14">
            <p className="text-center text-white text-light text-2xl sm:text-4xl flex flex-col pb-4">
              {title}
              <span className="text-xs text-gray-600 sm:text-base">{subtitle}</span>
            </p>
            <div className="flex flex-col justify-center gap-2 sm:gap-4 max-w-2xl mx-auto w-full">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard key={index} restaurant={restaurant} index={index} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex w-full flex-col justify-center">
          <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 sm:text-2xl">
            No restaurant stats available
          </h2>
        </div>
      )}
    </div>
  )
}

export const NewRestaurantCardsContainer: React.FC<RestaurantCardsContainerProps> = ({ restaurants, title, subtitle }) => {
  return (
    <div className="flex flex-col justify-center gap-8 sm:gap-4 px-4 sm:px-0">
      {restaurants ? (
        <div className="flex flex-col justify-center gap-8 sm:gap-4">
          <div className="flex flex-col justify-center gap-1 sm:gap-1 max-w-sm sm:max-w-xl mx-auto w-full mt-6 sm:mt-14">
            <p className="text-center text-white text-light text-2xl sm:text-4xl flex flex-col pb-4">
              {title}
              <span className="text-xs text-gray-600 sm:text-base">{subtitle}</span>
            </p>
            <div className="flex flex-col justify-center gap-2 sm:gap-4 max-w-2xl mx-auto w-full">
              {restaurants.map((restaurant, index) => {
                const timestamp = restaurant.firstCheckInDate
                const firstCheckInDate = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : 'N/A'
                return (
                  <RestaurantCard key={index} restaurant={restaurant} index={index} subtitle={`First check in ${firstCheckInDate}`} hideCrown />
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex w-full flex-col justify-center pt-20 sm:pt-56">
          <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 sm:text-2xl">
            No restaurant stats available
          </h2>
        </div>
      )}
    </div>
  )
}
