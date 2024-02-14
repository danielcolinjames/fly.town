import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'

async function getData(restaurantId: string): Promise<{ restaurantName: string, checkinCount: number, recentCheckins: any[] }> {
  try {
    const client = await clientPromise;
    const db = client.db('flytown');

    const checkinsCollection = db.collection("checkins");
    const restaurantsCollection = db.collection("restaurants");

    // Fetch total count of check-ins for the restaurant
    const count = await checkinsCollection.countDocuments({ restaurant_id: restaurantId });

    // Fetch the restaurant's full name using its slug or unique identifier
    const restaurantDoc = await restaurantsCollection.findOne({ restaurant_id: restaurantId });
    const restaurantName = restaurantDoc?.full_name || "";

    // Fetch the last 10 check-ins for the restaurant
    const recentCheckins = await checkinsCollection.find({ restaurant_id: restaurantId })
      .sort({ created_at: -1 })
      .limit(20)
      .toArray();

    return { restaurantName, checkinCount: count, recentCheckins }
  } catch (e) {
    console.error(e);
    return { restaurantName: "", checkinCount: 0, recentCheckins: [] }
  }
}

export default async function RestaurantPage({ params }: { params: { restaurant: string } }) {
  const restaurantId = params.restaurant
  const { restaurantName, checkinCount, recentCheckins } = await getData(restaurantId)
  // console.log(data)

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pb-40">
      <Navbar />
      <div className="flex w-full flex-col px-8">
        <div className="relative flex w-full flex-col justify-center gap-5 pt-14 md:gap-10 md:pt-32">
          <div className="w-full md:w-auto md:max-w-3xl mx-auto">
            <div className='flex flex-col justify-center gap-3 pb-10 md:pb-8'>
              <p className="text-left text-4xl text-white md:text-5xl">
                {restaurantName}
              </p>
              <p className="text-left text-xl text-white md:text-2xl">
                {checkinCount.toLocaleString()} lifetime check ins
              </p>
            </div>
            <div className='pt-10'>
              <p className="text-left text-xl text-gray-700 md:text-2xl pb-2 md:pb-3">
                Recent Check Ins
              </p>
              <div className="flex flex-col gap-2">
                {recentCheckins.map((checkIn, index) => (
                  <div key={index} className="">
                    <p className='text-gray-500 text-lg'>{new Date(checkIn.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
