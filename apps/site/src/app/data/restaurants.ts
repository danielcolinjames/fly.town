import { Restaurant } from '../components/RestaurantCardsContainer'
import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'

export async function getTopRestaurantsLast24Hours(): Promise<Restaurant[]> {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)
  const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

  const topRestaurants = await db
    .collection('checkins')
    .aggregate([
      {
        $addFields: {
          // Convert created_at from string to date
          createdAtDate: { $dateFromString: { dateString: '$created_at' } },
        },
      },
      {
        $match: {
          createdAtDate: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: '$restaurant_id',
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
      const restaurant = await db.collection('restaurants').findOne({ restaurant_id: item._id })
      if (!restaurant) throw new Error('Restaurant not found') // Handle potential null restaurant
      return {
        ...restaurant,
        restaurant_id: item._id, // Ensure this matches the Restaurant type's expected property
        totalCheckins: item.totalCheckins,
        // Ensure you include default or fetched values for full_name and accessLevels
        full_name: restaurant.full_name || 'Unknown Restaurant', // Example default value
        accessLevels: restaurant.accessLevels || ['Tier 1'], // Example default value
      }
    })
  )

  return restaurantDetails
}
