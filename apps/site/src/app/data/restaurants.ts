import { Restaurant } from '../components/RestaurantCardsContainer'
import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'
import { ignoredRestaurantIds } from '../lib/ignored'
import { format } from 'date-fns/format'
import { subHours, startOfToday, addDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

// Calculate the current time in UTC
const nowUTC = new UTCDate()

// Calculate the start of today in UTC and subtract 5 hours to align with 5 AM ET / 10 AM UTC
const startOfTodayUTC = startOfToday()
const adjustedStartOfToday = subHours(startOfTodayUTC, -10)

// Determine if the current UTC time is before or after 10 AM UTC
let startOfRangeRaw: Date
if (nowUTC >= adjustedStartOfToday) {
  // If after 10 AM UTC, the range starts from the adjusted start of today
  startOfRangeRaw = adjustedStartOfToday
} else {
  // If before 10 AM UTC, the range starts from the adjusted start of the previous day
  startOfRangeRaw = subHours(startOfTodayUTC, 14)
}

// The end of range is always 24 hours after the start of range
export const startOfRange: Date = startOfRangeRaw
export const endOfRange: Date = addDays(startOfRange, 1)

console.log(`Start of Range: ${format(startOfRange, "yyyy-MM-dd HH:mm:ss'Z'", {})}`)
console.log(`End of Range: ${format(endOfRange, "yyyy-MM-dd HH:mm:ss'Z'", {})}`)

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
          createdAtDate: { $gte: startOfRange, $lt: endOfRange },
          // Exclude documents with restaurantId in excludedIds
          restaurantId: { $nin: ignoredRestaurantIds },
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
    startOfRange: startOfRange,
    endOfRange: endOfRange,
  }
}
