import clientPromise from '../lib/mongodb'
import { Redis } from '@upstash/redis'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { Crown, Plane, PlaneIcon, PlaneLandingIcon, PlaneTakeoff } from 'lucide-react'
import classNames from 'classnames'
import { RestaurantCard } from './components/RestaurantCard'
import { Restaurant, RestaurantCardsContainer } from './components/RestaurantCardsContainer'
import { getTopRestaurantsLast24Hours } from './data/restaurants'

const redis = new Redis({
  url: 'https://light-bass-33631.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN ?? '',
})

type flycastEntry = {
  count: number
  timestamp: string
}

function getEasternTimeDate() {
  const now = new Date()
  // console.log('Current time:', now.toString())

  if (process.env.NODE_ENV === 'development') {
    // Use local dev time locally
    return now
  } else {
    // Assume UTC in prod
    const easternTimeOffset = -5 // Adjust to -4 during Daylight Saving Time
    const utc = now.getTime() + now.getTimezoneOffset() * 60000 // Convert to UTC
    return new Date(utc + easternTimeOffset * 3600000)
  }
}

async function getCheckinCountsByRestaurant() {
  const client = await clientPromise
  const db = client.db('flytown')

  const checkinCounts = await db
    .collection('checkins')
    .aggregate([
      {
        $group: {
          _id: '$restaurant_id', // Group by restaurant_id
          totalCheckins: { $count: {} }, // Count the checkins per restaurant
        },
      },
      { $sort: { totalCheckins: -1 } }, // Sort by totalCheckins in descending order
    ])
    .toArray()

  return checkinCounts
}

async function getRestaurantsSortedByCheckins() {
  const client = await clientPromise
  const db = client.db('flytown')

  const checkinCounts = await getCheckinCountsByRestaurant()

  // Map of restaurant_id to totalCheckins for quick lookup
  const checkinMap = new Map(checkinCounts.map(({ _id, totalCheckins }) => [_id, totalCheckins]))

  // Fetch all restaurants
  let restaurants = await db.collection('restaurants').find().toArray()

  // Add totalCheckins to each restaurant from checkinMap
  restaurants = restaurants.map(restaurant => ({
    ...restaurant,
    totalCheckins: checkinMap.get(restaurant.restaurant_id) || 0, // Default to 0 if no checkins found
  }))

  // Sort restaurants by totalCheckins
  restaurants.sort((a, b) => b.totalCheckins - a.totalCheckins)

  return restaurants
}

async function getData() {
  const date = getEasternTimeDate()
  const todayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` // Format: "YYYY-MM-DD"
  const flycastArray: flycastEntry[] = (await redis.get(todayKey)) || []

  if (flycastArray.length === 0) {
    return {
      count: undefined,
      timestamp: undefined,
    }
  }

  // Create an object to store the frequency of each count
  const countFrequency: { [key: number]: number } = {}
  flycastArray.forEach((flycast: flycastEntry) => {
    if (countFrequency[flycast.count]) {
      countFrequency[flycast.count]++
    } else {
      countFrequency[flycast.count] = 1
    }
  })

  // Find the count with the highest frequency (mode)
  let modeCount = undefined
  let maxFrequency = 0
  for (const count in countFrequency) {
    if (countFrequency[count] > maxFrequency) {
      maxFrequency = countFrequency[count]
      modeCount = Number(count)
    }
  }

  // Get latest timestamp
  let latestTimestamp = new Date(0) // Epoch
  flycastArray.map((flycast: flycastEntry) => {
    const currentTimestamp = new Date(flycast.timestamp)
    if (currentTimestamp > latestTimestamp) {
      latestTimestamp = currentTimestamp
    }
  })

  const averageCount = modeCount

  const etTimestamp = latestTimestamp

  return {
    count: averageCount,
    timestamp: etTimestamp,
    // restaurants: restaurants,
  }
}

export default async function Home() {
  const data = await getData()
  const count = data?.count ?? undefined
  const timestamp = data?.timestamp ?? undefined

  // const restaurants = await getRestaurantsSortedByCheckins()
  const topRestaurants24h = await getTopRestaurantsLast24Hours()

  // Convert the latest timestamp from Redis data for display
  let latestTime
  if (timestamp) {
    latestTime = new Date(timestamp)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/^0+/, '')
  }

  const today = getEasternTimeDate().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="flex min-h-screen w-full flex-col items-center overflow-hidden pb-10 sm:pb-20 bg-[#0b0b0b]">
      <Navbar />
      <div className="flex w-full flex-col">
        {count ? (
          <div className="flex flex-col justify-center items-center mt-10">
            <div className="relative h-auto flex flex-col justify-center gap-0 bg-[#070707] border-[#202020] border-y w-full text-white py-8 sm:py-10">
              <p className="text-center text-lg text-gray-600 sm:text-2xl">{today}</p>
              <div className="flex flex-col items-center justify-center gap-1">
                <h1 className="text-center text-white text-6xl font-medium tracking-tighter sm:text-8xl">
                  {count.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </h1>
                <div className="flex flex-col justify-center gap-0">
                  <p className="text-center text-lg text-white sm:text-xl flex flex-row items-center font-light justify-center">
                    $FLY per check in today
                  </p>
                  <p className="text-center text-sm text-gray-600 sm:text-base">Last updated at {latestTime} ET</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <div className="relative flex mx-auto flex-col justify-center mt-10 sm:mt-20 bg-[#070707] border-[#202020] border-y w-full px-8 py-8 sm:py-10">
              <h2 className="text-center font-light text-base italic tracking-tighter text-gray-500 sm:text-xl">
                No FLYcast submitted yet for {today}
              </h2>
            </div>
          </div>
        )}
        <RestaurantCardsContainer restaurants={topRestaurants24h} title="Top 10" subtitle="Last 24h" />
      </div>
      <Footer />
    </main>
  )
}
