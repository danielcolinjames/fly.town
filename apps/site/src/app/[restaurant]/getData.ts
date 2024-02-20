import { SITE_DB_NAME } from '@/lib/utils'
import clientPromise from '../../lib/mongodb'

export interface AccessLevelDetails {
  memberStatus: string
  imageArtist: string
  image: string
  accent: string
  whiteText: boolean
  count: number
}

export async function getData(restaurantId: string): Promise<{
  restaurantName: string
  checkinCount: number
  recentCheckins: any[]
  accessLevels: AccessLevelDetails
  firstCheckinDate: Date | null
  mostRecentCheckinDate: Date | null
  checkinsLast24h: number
  checkinsLastMonth: number
  numberOfMemberships: number
  averageCheckinsPerMembership: number
} | null> {
  try {
    const client = await clientPromise
    const db = client.db(SITE_DB_NAME)

    // Calculate time frames for the last 24 hours and last month
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const aggregationPipeline = [
      {
        $addFields: {
          // Convert createdAt from string to date
          createdAtDate: { $dateFromString: { dateString: '$createdAt' } },
        },
      },
      {
        $match: {
          restaurantId: restaurantId,
        },
      },
      {
        $sort: { createdAtDate: -1 }, // Sort by createdAtDate in descending order
      },
    ]

    const checkins = await db.collection('checkIns').aggregate(aggregationPipeline).toArray()

    // Assuming we have the restaurant's data including access levels
    const restaurantDoc = await db.collection('restaurants').findOne({ restaurantId: restaurantId })
    const restaurantName = restaurantDoc?.restaurantName || ''
    const accessLevels = restaurantDoc?.accessLevels || {}

    const checkinCount = checkins.length
    const recentCheckins = checkins.slice(0, 20) // Get the most recent 20 check-ins
    const firstCheckinDate = checkinCount > 0 ? checkins[checkinCount - 1].createdAtDate : null
    const mostRecentCheckinDate = checkinCount > 0 ? checkins[0].createdAtDate : null
    const checkinsLast24h = checkins.filter(c => c.createdAtDate >= oneDayAgo).length
    const checkinsLastMonth = checkins.filter(c => c.createdAtDate >= oneMonthAgo).length
    const numberOfMembershipsAggregation = [
      {
        $match: {
          restaurantId: restaurantId, // Use the restaurantId directly for matching
        },
      },
      {
        $count: 'numberOfMemberships',
      },
    ]

    const numberOfMembershipsResult = await db
      .collection('memberships')
      .aggregate(numberOfMembershipsAggregation)
      .toArray()
    const numberOfMemberships =
      numberOfMembershipsResult.length > 0 ? numberOfMembershipsResult[0].numberOfMemberships : 0
    let averageCheckinsPerMembership = numberOfMemberships > 0 ? checkinCount / numberOfMemberships : 0

    return {
      restaurantName,
      checkinCount,
      recentCheckins,
      accessLevels,
      firstCheckinDate,
      mostRecentCheckinDate,
      checkinsLast24h,
      checkinsLastMonth,
      numberOfMemberships,
      averageCheckinsPerMembership,
    }
  } catch (e) {
    console.error(e)
    return null
  }
}
