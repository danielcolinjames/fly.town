import { Restaurant } from '../components/RestaurantCardsContainer'
import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'

export async function getTopRestaurantsLast24Hours(): Promise<Restaurant[]> {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

  const topRestaurants = await db
    .collection('checkIns')
    .aggregate([
      {
        $addFields: {
          // Convert created_at from string to date
          createdAtDate: { $dateFromString: { dateString: '$createdAt' } },
        },
      },
      {
        $match: {
          createdAtDate: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: '$restaurantId',
          totalCheckins: { $count: {} },
        },
      },
      { $sort: { totalCheckins: -1 } },
      { $limit: 10 }, // Adjust the limit as needed
    ])
    .toArray()

  // Fetch restaurant details
  const restaurantDetails: Restaurant[] = await Promise.all(
    topRestaurants.map(async item => {
      const restaurant = await db.collection('restaurants').findOne({ restaurantId: item._id })
      if (!restaurant) {
        console.error('Restaurant not found') // Handle potential null restaurant
      }
      return {
        ...restaurant,
        restaurantId: item._id,
        totalCheckins: item.totalCheckins,
        restaurantName: restaurant?.restaurantName,
        accessLevels: restaurant?.accessLevels,
      }
    })
  )

  return restaurantDetails
}
