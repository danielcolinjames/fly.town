import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'

async function getData(restaurantId: string): Promise<{
  restaurantName: string
  checkinCount: number
  recentCheckins: any[]
  accessLevels: AccessLevelDetails | {}
  firstCheckinDate: Date | null
  mostRecentCheckinDate: Date | null
  checkinsLast24h: number
  checkinsLastMonth: number
  numberOfMemberships: number
  averageCheckinsPerMembership: number
}> {
  try {
    const client = await clientPromise
    const db = client.db('flytown')

    // Calculate time frames for the last 24 hours and last month
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    const aggregationPipeline = [
      {
        $addFields: {
          // Convert created_at from string to date
          createdAtDate: { $dateFromString: { dateString: '$created_at' } },
        },
      },
      {
        $match: {
          restaurant_id: restaurantId,
        },
      },
      {
        $sort: { createdAtDate: -1 }, // Sort by createdAtDate in descending order
      },
    ]

    const checkins = await db.collection('checkins').aggregate(aggregationPipeline).toArray()

    // Assuming we have the restaurant's data including access levels
    const restaurantDoc = await db.collection('restaurants').findOne({ restaurant_id: restaurantId })
    const restaurantName = restaurantDoc?.full_name || ''
    const accessLevels = restaurantDoc?.accessLevels || {}

    const checkinCount = checkins.length
    const recentCheckins = checkins.slice(0, 20) // Get the most recent 20 check-ins
    const firstCheckinDate = checkinCount > 0 ? checkins[checkinCount - 1].createdAtDate : null
    const mostRecentCheckinDate = checkinCount > 0 ? checkins[0].createdAtDate : null
    const checkinsLast24h = checkins.filter(c => c.createdAtDate >= oneDayAgo).length
    const checkinsLastMonth = checkins.filter(c => c.createdAtDate >= oneMonthAgo).length

    // Extract and count memberships associated with the restaurantName
    const numberOfMembershipsAggregation = [
      {
        $project: {
          attributes: 1, // Only project the attributes field
          restaurantName: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$attributes',
                  as: 'attr',
                  cond: { $eq: ['$$attr.trait_type', 'restaurantName'] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          'restaurantName.value': restaurantName, // Use the restaurant name obtained from the restaurant document
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
    return {
      restaurantName: '',
      checkinCount: 0,
      recentCheckins: [],
      accessLevels: {},
      firstCheckinDate: null,
      mostRecentCheckinDate: null,
      checkinsLast24h: 0,
      checkinsLastMonth: 0,
      numberOfMemberships: 0,
      averageCheckinsPerMembership: 0,
    }
  }
}

interface AccessLevelDetails {
  memberStatus: string
  imageArtist: string
  image: string
}

export default async function RestaurantPage({ params }: { params: { restaurant: string } }) {
  const restaurantId = params.restaurant
  const {
    restaurantName,
    checkinCount,
    firstCheckinDate,
    mostRecentCheckinDate,
    checkinsLast24h,
    checkinsLastMonth,
    numberOfMemberships,
    averageCheckinsPerMembership,
    accessLevels,
  } = await getData(restaurantId)
  // console.log(data)

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pb-40 bg-[#0b0b0b]">
      <Navbar />
      <div className="flex w-full flex-col px-8">
        <div className="relative flex w-full flex-col justify-center gap-5 pt-14 md:gap-10 md:pt-32">
          <div className="w-full md:w-auto md:max-w-8xl mx-auto">
            <div className="flex flex-col justify-center gap-3 pb-10 md:pb-8">
              <p className="text-left text-4xl text-white md:text-7xl">{restaurantName}</p>
              <p className="text-left text-xl text-white md:text-2xl">
                {checkinCount.toLocaleString()} lifetime check ins
              </p>
              <p className="text-sm text-gray-600">
                First check in: {firstCheckinDate ? new Date(firstCheckinDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="pt-0 md:pt-10">
              <p className="text-left text-xl text-gray-600 md:text-2xl pb-2 md:pb-3">Access Levels</p>
              <div className="flex flex-col md:flex-row gap-8 md:gap-4 w-full">
                {Object.entries(accessLevels).map(([level, details], index) => (
                  <div key={index} className="rounded-lg shadow gap-4">
                    <img src={details.image} alt={`Access Level ${level}`} className="mt-2 max-h-96 rounded" />
                    <p className="text-gray-700 justify-center text-left md:text-center">
                      Artist: {details.imageArtist}
                    </p>
                    <div className="pt-0 md:pt-2 gap-2">
                      <div className="flex gap-2 justify-start md:justify-center">
                        <p className="text-gray-400 text-2xl font-semibold">{level}</p>
                        <p className="text-white text-2xl font-semibold">{details.memberStatus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-gray-200 pt-16 md:pt-20">
              {/* <p className="text-left text-xl text-gray-600 md:text-2xl pb-2 md:pb-3">Restaurant Stats</p> */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-lg text-gray-400">First check in</p>
                  <p className="text-xl text-white">
                    {firstCheckinDate ? new Date(firstCheckinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-lg text-gray-400">Most recent check in</p>
                  <p className="text-xl text-white">
                    {mostRecentCheckinDate ? new Date(mostRecentCheckinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-lg text-gray-400">Last 24h check ins</p>
                  <p className="text-xl text-white">{checkinsLast24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-lg text-gray-400">Last 30d check ins</p>
                  <p className="text-xl text-white">{checkinsLastMonth.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-lg text-gray-400">Number of members</p>
                  <p className="text-xl text-white">{numberOfMemberships.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-lg text-gray-400">Avg. check ins / member</p>
                  <p className="text-xl text-white">{averageCheckinsPerMembership.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* <div className='pt-10'>
              <p className="text-left text-xl text-gray-700 md:text-2xl pb-2 md:pb-3">
                Stats
              </p>
              <div className="flex flex-col gap-2">
                <p>First Check-in: {firstCheckinDate ? new Date(firstCheckinDate).toLocaleString() : 'N/A'}</p>
                <p>Most Recent Check-in: {mostRecentCheckinDate ? new Date(mostRecentCheckinDate).toLocaleString() : 'N/A'}</p>
                <p>Check-ins in the Last 24 Hours: {checkinsLast24h}</p>
                <p>Check-ins in the Last Month: {checkinsLastMonth}</p>
                <p>Number of Memberships: {numberOfMemberships}</p>
                <p>Average Check-ins per Membership: {averageCheckinsPerMembership.toFixed(2)}</p>
              </div>
            </div>
          */}
          </div>

          {/* <div className='pt-10'>
              <p className="text-left text-xl text-gray-600 md:text-2xl pb-2 md:pb-3">
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
          </div> */}
        </div>
      </div>
      <Footer />
    </main>
  )
}
