import clientPromise from '../../lib/mongodb'
import { SITE_DB_NAME } from '@/lib/utils'
import { NewRestaurantCardsContainer, Restaurant, RestaurantCardsContainer } from '../components/RestaurantCardsContainer'



async function getData() {
  try {
    const client = await clientPromise
    const db = client.db(SITE_DB_NAME)

    const restaurantsSortedByFirstCheckIn = await db
      .collection('checkIns')
      .aggregate([
        {
          $group: {
            _id: '$restaurantId',
            firstCheckInDate: { $min: '$createdAt' },
          },
        },
        {
          $sort: { firstCheckInDate: -1 },
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: '_id',
            foreignField: 'restaurantId',
            as: 'restaurantDetails',
          },
        },
        {
          $unwind: '$restaurantDetails',
        },
        {
          $project: {
            _id: 0,
            restaurantId: '$_id',
            restaurantName: '$restaurantDetails.restaurantName',
            firstCheckInDate: 1,
            accessLevels: '$restaurantDetails.accessLevels', // Assuming this field exists
            totalCheckins: '$restaurantDetails.totalCheckins' // Assuming this field exists or you can calculate it        
          },
        },
      ])
      .toArray()
    return {
      recentFirstCheckIns: restaurantsSortedByFirstCheckIn || [],
    }
  } catch (e) {
    console.error(e)
    return {
      recentFirstCheckIns: [],
    }
  }
}
export default async function LatestPage() {
  const data = await getData()
  const recentFirstCheckIns = data.recentFirstCheckIns as Restaurant[]

  return (
    <NewRestaurantCardsContainer restaurants={recentFirstCheckIns} title="Newest restaurants" subtitle="By recency of first check in" />
  )
}
