// 'use client'
import { parseDetailedLocations } from '@/app/lib/locations'
import { LocateFixedIcon, LocateIcon, MapPin, Pin } from 'lucide-react'
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
  subtitle?: string
  location: string
  highestValueKeyAccent: string
}) => {
  const parsedLocations = parseDetailedLocations(location)

  return (
    <div className="flex flex-col gap-4 pb-4 sm:pb-10 max-w-3xl mx-auto px-8">
      <Link
        href="/"
        className="block text-sm sm:text-base duration-150 transition-all pt-4 w-auto hover:opacity-50"
        style={{ color: highestValueKeyAccent }}
      >
        &larr; Top 10
      </Link>
      <span className="text-left text-5xl text-white sm:text-7xl">{restaurantName}</span>
      {subtitle && <p className="text-left text-xl text-gray-400 sm:text-2xl">{subtitle}</p>}
      <div className="flex flex-col justify-center gap-1 rounded-full">
        {parsedLocations.length > 1 && (
          <div className="flex flex-row items-center">
            <span className="text-gray-500 text-sm sm:text-lg">{parsedLocations.length} locations</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {parsedLocations.map(location => {
            return (
              <div className="flex flex-row items-center gap-1 sm:gap-2" key={location.streetAddress}>
                <MapPin className="text-gray-500 size-4 sm:size-5" style={{ color: highestValueKeyAccent }} />
                <span
                  style={{ color: highestValueKeyAccent }}
                  key={location.streetAddress}
                  className="text-gray-500 text-base sm:text-xl"
                >
                  {location.streetAddress}, {location.state}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
