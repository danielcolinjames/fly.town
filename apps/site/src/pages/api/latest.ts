import clientPromise from '../../lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next'

interface RestaurantFirstCheckIn {
  restaurant_name: string
  first_check_in_date: string
}

export default async (req: NextApiRequest, res: NextApiResponse<RestaurantFirstCheckIn[] | { error: string }>) => {
  try {
    const client = await clientPromise
    const db = client.db('flytown')

    const recentFirstCheckins = await db
      .collection('checkins')
      .aggregate([
        {
          $group: {
            _id: '$restaurant_name',
            first_check_in_date: { $min: '$created_at' },
          },
        },
        {
          $sort: { first_check_in_date: -1 },
        },
        {
          $limit: 100,
        },
        {
          $project: {
            _id: 0,
            restaurant_name: '$_id',
            first_check_in_date: 1,
          },
        },
      ])
      .toArray()

    // Map the results to match the CheckIn interface
    const formattedCheckins = recentFirstCheckins.map(doc => ({
      restaurant_name: doc.restaurant_name,
      first_check_in_date: doc.first_check_in_date,
    }))
    res.status(200).json(formattedCheckins)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
