import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { RestaurantCard } from '../components/RestaurantCard'
import { Restaurant, RestaurantCardsContainer } from '../components/RestaurantCardsContainer'
import { ignoredRestaurantIds } from '../lib/ignored'

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
  let allRestaurants = await db.collection('restaurants').find().toArray()

  // Add totalCheckins to each restaurant from checkinMap
  const restaurants = allRestaurants.map(restaurant => ({
    restaurant_id: restaurant.restaurant_id,
    full_name: restaurant.full_name, // Assuming 'full_name' is a field in your documents
    accessLevels: restaurant.accessLevels || [], // Assuming 'accessLevels' is an optional field in your documents
    totalCheckins: checkinMap.get(restaurant.restaurant_id) || 0,
    // Explicitly set or default any other required properties here
  })) as Restaurant[]

  const filteredRestaurants = restaurants.filter(restaurant => !ignoredRestaurantIds.includes(restaurant.restaurant_id))

  // Sort restaurants by totalCheckins
  filteredRestaurants.sort((a, b) => b.totalCheckins - a.totalCheckins)

  return filteredRestaurants
}

export default async function Home() {
  const restaurants = await getRestaurantsSortedByCheckins()

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pb-10 sm:pb-40 relative">
      <Navbar />
      <RestaurantCardsContainer
        restaurants={restaurants}
        title="All Restaurants"
        subtitle="Sorted by lifetime check ins"
      />
      <Footer />
    </main>
  )
}
