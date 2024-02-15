import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

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
  // console.log('checkinCounts:', checkinCounts)

  // Map of restaurant_id to totalCheckins for quick lookup
  const checkinMap = new Map(checkinCounts.map(({ _id, totalCheckins }) => [_id, totalCheckins]))

  // console.log('checkinMap:', checkinMap)

  // Fetch all restaurants
  let restaurants = await db.collection('restaurants').find().toArray()

  // console.log('restaurants:', restaurants)

  // Add totalCheckins to each restaurant from checkinMap
  restaurants = restaurants.map(restaurant => ({
    ...restaurant,
    totalCheckins: checkinMap.get(restaurant.restaurant_id) || 0, // Default to 0 if no checkins found
  }))

  // Sort restaurants by totalCheckins
  restaurants.sort((a, b) => b.totalCheckins - a.totalCheckins)

  return restaurants
}


export default async function Home() {
  const restaurants = await getRestaurantsSortedByCheckins()

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pb-40">
      <Navbar />
      <div className="flex w-full flex-col px-8">
        <div className="flex flex-col justify-center gap-8 md:gap-4">
          {restaurants ? (
            <div className="flex flex-col justify-center gap-8 md:gap-4">
              <div className="flex flex-col justify-center gap-4 md:gap-2 max-w-2xl mx-auto w-full pt-24 md:pt-40">
                <p className="text-left text-2xl text-gray-700 md:text-4xl pb-4">All Restaurants</p>
                {restaurants.map((restaurant: any, index: any) => {
                  // if (restaurant.totalCheckins < 100 || restaurant.full_name === null) {
                  //   return null
                  // }
                  return <RestaurantCard key={index} restaurant={restaurant} index={index} />
                })}
              </div>
            </div>
          ) : (
            <div className="relative flex w-full flex-col justify-center pt-20 md:pt-56">
              <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 md:text-2xl">
                No restaurant stats available
              </h2>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

type AccessLevel = {
  image: string
}

const RestaurantCard = ({ restaurant, index }: { restaurant: any; index: number }) => {
  // Assuming `lowestTierImage` is the field for the lowest tier image URL
  // Define a more specific type for accessLevels
  const accessLevels: Record<string, AccessLevel> = restaurant.accessLevels || {}
  const imageUrl = Object.values(accessLevels)[0]?.image || ''

  // bg-[#0a0a0a] border-[#2A2A2A] border hover:border-white p-1
  return (
    <Link
      href={`/${restaurant.restaurant_id}`}
      className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-start hover:bg-[#0a0a0a] md:px-4 py-2 duration-200 transition-all rounded-xl"
    >
      <img src={imageUrl} alt={`${restaurant.full_name} Image`} className="w-16 h-16 object-cover rounded-full" />
      <div className="flex flex-col items-center md:items-start">
        <p className="text-white text-xl md:text-2xl">
          <span className="text-gray-500 pr-2 md:pr-3">#{index + 1}</span>
          {restaurant.full_name}
        </p>
        <p className="text-gray-600 text-base md:text-lg">{restaurant.totalCheckins.toLocaleString()} check ins</p>
      </div>
    </Link>
  )
}
