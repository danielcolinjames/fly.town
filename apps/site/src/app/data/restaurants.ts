import { Restaurant } from '../components/RestaurantCardsContainer'
import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'
import { startOfDay, addHours, addDays } from 'date-fns'

const excludedIds = ['flybar']

const getTimezoneOffset = (timezone: string) => {
  // This is a placeholder function. You'll need to implement timezone offset calculation
  // or lookup based on the timezone you're working with. This might involve using a third-party
  // service or a library that can provide this information.
  return -5 // Example: Offset for Eastern Time (UTC-5)
}

const getStartOfTodayUTCForTimezone = (timezone: string) => {
  const now = new Date()
  const timezoneOffset = getTimezoneOffset(timezone)
  const startOfTodayLocal = startOfDay(now)
  const startOfTodayLocalAt10AM = addHours(startOfTodayLocal, 10 + timezoneOffset)
  return startOfTodayLocalAt10AM
}

// Calculate start and end times
const timezone = 'America/New_York' // Example timezone
const startOfTodayUTC = getStartOfTodayUTCForTimezone(timezone)
const endOfTodayUTC = addHours(addDays(startOfTodayUTC, 1), 10)

export async function getTopRestaurantsLast24Hours() {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)

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
          createdAtDate: { $gte: startOfTodayUTC, $lt: endOfTodayUTC },
          // Exclude documents with restaurantId in excludedIds
          restaurantId: { $nin: excludedIds },
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
