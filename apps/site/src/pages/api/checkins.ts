import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

interface CheckIn {
  check_in_id: number;
  created_at: string;
  restaurant_name: string;
}

export default async (req: NextApiRequest, res: NextApiResponse<CheckIn[] | { error: string }>) => {
   try {
       const client = await clientPromise;
       const db = client.db("flytown");

       const recentCheckins = await db.collection('checkins')
      .find({})
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Map the results to match the CheckIn interface
    const formattedCheckins = recentCheckins.map(doc => ({
      check_in_id: doc.check_in_id,
      created_at: doc.created_at,
      restaurant_name: doc.restaurant_name,
      metadata: doc.metadata
    }));

    res.status(200).json(formattedCheckins);
   } catch (e) {
       console.error(e);
   }
};