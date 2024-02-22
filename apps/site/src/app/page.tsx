import clientPromise from '../lib/mongodb'
import { Redis } from '@upstash/redis'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { RestaurantCardsContainer } from './components/RestaurantCardsContainer'
import { getTopRestaurantsLast24Hours, getTotalCheckInsForRange } from './data/restaurants'
import { SITE_DB_NAME } from '@/lib/utils'
import { Nfc, PersonStanding, Rocket, RocketIcon } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { addDays } from 'date-fns'

const redis = new Redis({
  url: 'https://light-bass-33631.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN ?? '',
})

type flycastEntry = {
  count: number
  timestamp: string
}

function getEasternTimeDate() {
  const now = new Date()
  // console.log('Current time:', now.toString())

  if (process.env.NODE_ENV === 'development') {
    // Use local dev time locally
    return now
  } else {
    // Assume UTC in prod
    const easternTimeOffset = -5 // Adjust to -4 during Daylight Saving Time
    const utc = now.getTime() + now.getTimezoneOffset() * 60000 // Convert to UTC
    return new Date(utc + easternTimeOffset * 3600000)
  }
}

async function getCheckinCountsByRestaurant() {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)

  const checkinCounts = await db
    .collection('checkIns')
    .aggregate([
      {
        $group: {
          _id: '$restaurantId', // Group by restaurantId
          totalCheckins: { $count: {} }, // Count the checkins per restaurant
        },
      },
      { $sort: { totalCheckins: -1 } }, // Sort by totalCheckins in descending order
    ])
    .toArray()

  return checkinCounts
}

async function getMostRecentCheckin() {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)

  const mostRecentCheckin = await db.collection('checkIns').find().sort({ createdAt: -1 }).limit(1).toArray()

  if (mostRecentCheckin.length > 0) {
    const { checkInId, createdAt } = mostRecentCheckin[0]
    return {
      checkinId: checkInId,
      date: new Date(createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    }
  }

  return null
}

async function getData() {
  const date = getEasternTimeDate()
  const todayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` // Format: "YYYY-MM-DD"
  const flycastArray: flycastEntry[] = (await redis.get(todayKey)) || []

  if (flycastArray.length === 0) {
    return {
      count: undefined,
      timestamp: undefined,
    }
  }

  // Create an object to store the frequency of each count
  const countFrequency: { [key: number]: number } = {}
  flycastArray.forEach((flycast: flycastEntry) => {
    if (countFrequency[flycast.count]) {
      countFrequency[flycast.count]++
    } else {
      countFrequency[flycast.count] = 1
    }
  })

  // Find the count with the highest frequency (mode)
  let modeCount = undefined
  let maxFrequency = 0
  for (const count in countFrequency) {
    if (countFrequency[count] > maxFrequency) {
      maxFrequency = countFrequency[count]
      modeCount = Number(count)
    }
  }

  // Get latest timestamp
  let latestTimestamp = new Date(0) // Epoch
  flycastArray.map((flycast: flycastEntry) => {
    const currentTimestamp = new Date(flycast.timestamp)
    if (currentTimestamp > latestTimestamp) {
      latestTimestamp = currentTimestamp
    }
  })

  const averageCount = modeCount

  const etTimestamp = latestTimestamp

  return {
    count: averageCount,
    timestamp: etTimestamp,
    // restaurants: restaurants,
  }
}

async function getTotalMembershipsCount() {
  const client = await clientPromise
  const db = client.db(SITE_DB_NAME)

  const totalMemberships = await db.collection('memberships').countDocuments()

  return totalMemberships
}

export default async function Home() {
  const data = await getData()
  const count = data?.count ?? undefined
  const timestamp = data?.timestamp ?? undefined

  const { topRestaurants, endOfRange, startOfRange } = await getTopRestaurantsLast24Hours()
  const mostRecentCheckin = await getMostRecentCheckin()

  const totalCheckins = mostRecentCheckin?.checkinId ? mostRecentCheckin.checkinId : 0
  const totalUpdatedAt = mostRecentCheckin?.date
    ? new Date(mostRecentCheckin.date)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/^0+/, '')
    : undefined

  const totalMembershipsCount = await getTotalMembershipsCount()

  // Convert the latest timestamp from Redis data for display
  let latestTime
  if (timestamp) {
    latestTime = new Date(timestamp)
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/^0+/, '')
  }

  const today = getEasternTimeDate().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const iconSize = 24
  // Note: The incoming date is assumed to be in UTC. The displayed times for startOfRange and endOfRange will also be in UTC for consistency.
  const formatEndRangeUTC = (date: Date) => {
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
  }

  const formatStartRangeUTC = (date: Date) => {
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
  }

  // Adjusted subtitle to include formatted start and end of range in UTC
  const nycTimezoneString = 'America/New_York'
  const adjustedSubtitleUTC = `By check ins between ${formatEndRangeUTC(startOfRange)} 5AM ET — ${formatEndRangeUTC(endOfRange)} 5AM ET`

  // const formatLocalDateTime = (date: Date) => {
  //   return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true })}`;
  // };

  // // Adjusted subtitle to include formatted start and end of range
  // const adjustedSubtitle = `By check ins between ${formatLocalDateTime(startOfRange)} — ${formatLocalDateTime(endOfRange)}`;
  const totalCheckinsToday = await getTotalCheckInsForRange()

  const flycast = count

  const countInteger = Math.floor(flycast ?? 0)
  const countDecimal = (flycast ?? 0 - countInteger).toFixed(2).split('.')[1]

  return (
    <div className="flex w-full flex-col pb-14 sm:pb-32">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-between mx-auto w-full">
          {count ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 px-4 pt-10 w-full max-w-sm sm:max-w-lg md:max-w-4xl">
              {/* <HeroStatCard count={count} latestTime={latestTime} title="$FLY per check in today" today={today} /> */}
              {/* <div className="flex flex-col">
                <span className="relative text-white text-center font-regular text-3xl sm:text-5xl">
                  {countInteger}
                  <span className="text-gray-400 text-lg absolute bottom-0 w-auto">.{countDecimal}</span>
                </span>
                <h2 className="text-center font-light text-base tracking-tighter text-gray-500 sm:text-lg">
                  $FLY per check in today
                </h2>
              </div> */}
              <GlobalStatCard title="$FLY per check in today" statText={`${count}`} icon={<Rocket />} />
              {/* <HeroStatCard count={count} latestTime={latestTime} title="$FLY per check in today" today={today} /> */}
              <GlobalStatCard title="Total check ins today" statText={`${totalCheckinsToday.totalCheckIns.toLocaleString()}`} icon={<Nfc />} />
              <GlobalStatCard title="Total memberships" statText={`${totalMembershipsCount.toLocaleString()}`} icon={<PersonStanding />} />
              {/* <div className="flex flex-col">
                <span className="relative text-white text-center font-regular text-3xl sm:text-5xl">
                  {totalCheckinsToday.totalCheckIns}
                </span>
                <h2 className="text-center font-light text-base tracking-tighter text-gray-500 sm:text-lg">
                  Total check ins today
                </h2>
              </div> */}
            </div>
          ) : (
            <div className='pt-2 sm:pt-8' />
          )}
          {/* // <div className="bg-[#070707] border-[#202020] border-y w-full text-white py-4 sm:py-8">
            //   <h2 className="text-center font-light text-base italic tracking-tighter text-gray-500 sm:text-xl">
            //     No FLYcast submitted yet for {today}
            //   </h2>
            // </div>
          // )} */}
          {/* <div className="flex flex-row gap-4 w-full px-8">
              <StatCard title="Members" statText={totalMembershipsCount.toLocaleString()}>
                <PersonStanding size={iconSize} />
              </StatCard>
              <StatCard title="Check ins" statText={(totalCheckins + 5043).toLocaleString()}>
                <Nfc size={iconSize} />
              </StatCard>
            </div> */}
        </div>
      </div>
      {/* <div className='flex flex-col items-center w-full mx-auto pt-4 sm:pt-14'>
        <p className='text-gray-400 text-center'>
          Total check ins today
        </p>
        <p className='text-white  text-2xl'>
          {totalCheckinsToday.totalCheckIns}
        </p>
      </div> */}
      <div className="mt-4">
        <RestaurantCardsContainer restaurants={topRestaurants} title="Top restaurants" subtitle={adjustedSubtitleUTC} />
      </div>
    </div>
  )
}

const HeroStatCard = ({
  count,
  latestTime,
  title,
  today,
}: {
  count: number
  latestTime?: string
  title: string
  today: string
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <p className="text-center text-lg text-gray-600 sm:text-2xl">{today}</p>
      <h1 className="text-center text-white text-6xl font-medium tracking-tighter sm:text-8xl">
        {count.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
      </h1>
      <div className="flex flex-col justify-center gap-0">
        <p className="text-center text-lg text-white sm:text-xl flex flex-row items-center font-light justify-center">
          {title}
        </p>
        <p className="text-center text-sm text-gray-600 sm:text-base">Last updated at {latestTime} ET</p>
      </div>
    </div>
  )
}

const GlobalStatCard = ({ title, statText, icon }: { title: string, statText: string, icon: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-[#070707] border-[#202020] border-y w-full text-white px-4 py-5 rounded-xl min-w-[80px] sm:min-w-[225px]">
      {/* <div className="flex flex-row items-center justify-center gap-2 w-auto">
    {icon}
  </div> */}
      <div className="flex flex-col w-full gap-1">
        <p className="text-center text-sm text-gray-600 w-full">{title}</p>
        <h1 className="text-center text-white font-light tracking-tighter text-3xl sm:text-5xl">
          {statText}
        </h1>
      </div>
    </div>
  )
}

