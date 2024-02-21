import { Restaurant } from '../components/RestaurantCardsContainer'
import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'

export async function getTopRestaurantsLast24Hours() {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)
  // Create a date object for 12 AM UTC of the current day
  const startOfTodayUTC = new Date(new Date().setUTCHours(0, 0, 0, 0))
  const endOfTodayUTC = new Date(new Date().setUTCHours(23, 59, 59, 999))

  const topRestaurants = await db
    .collection('checkIns')
    .aggregate([
      {
        $addFields: {
          // Convert createdAt from string to date
          createdAtDate: { $dateFromString: { dateString: '$createdAt' } },
          // Lowercase the restaurantName for case-insensitive comparison
          lowercaseRestaurantName: { $toLower: '$restaurantName' },
        },
      },
      {
        $match: {
          createdAtDate: { $gte: startOfTodayUTC },
        },
      },
      {
        $group: {
          _id: '$restaurantId',
          totalCheckins: { $sum: 1 },
          // Preserve the original restaurant name for display
          restaurantName: { $first: '$restaurantName' },
          // Use the lowercase restaurant name for sorting
          lowercaseRestaurantName: { $first: '$lowercaseRestaurantName' },
        },
      },
      // Sort by totalCheckins descending, then by lowercaseRestaurantName ascending
      { $sort: { totalCheckins: -1, lowercaseRestaurantName: 1 } },
      { $limit: 10 }, // Adjust the limit as needed
    ])
    .toArray()

  // Fetch restaurant details
  const restaurantDetails = await Promise.all(
    topRestaurants.map(async item => {
      const restaurant = await db.collection('restaurants').findOne({ restaurantId: item._id })
      if (!restaurant) {
        console.error('Restaurant not found') // Handle potential null restaurant
        return null // Ensure we don't include undefined in the results
      }
      return {
        ...restaurant,
        restaurantId: item._id,
        totalCheckins: item.totalCheckins,
        restaurantName: restaurant.restaurantName,
        accessLevels: restaurant.accessLevels,
      } as Restaurant
    })
  )

  // Filter out any null entries from the results
  return {
    topRestaurants: restaurantDetails.filter((detail): detail is Restaurant => detail !== null),
    startOfRange: startOfTodayUTC,
    endOfRange: endOfTodayUTC,
  }
}
