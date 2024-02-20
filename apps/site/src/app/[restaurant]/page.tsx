import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'
import { AccessLevelDetails, getData } from './getData'
import { CalendarDays, Clock, Flag, Nfc, PersonStanding, Stamp } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { MembershipsSection } from './components/MembershipsSection'
import { RestaurantTitleSection } from './components/RestaurantTitleSection'
import { SITE_DB_NAME } from '@/lib/utils'
import { StatCard } from '../../components/StatCard'
import { formatDistanceToNow } from 'date-fns'

async function getMetadataData(
  restaurantId: string
): Promise<{ accessLevels: AccessLevelDetails[]; restaurantName: string }> {
  try {
    const client = await clientPromise
    const db = client.db(SITE_DB_NAME)

    const restaurantDoc = await db.collection('restaurants').findOne({ restaurantId: restaurantId })
    const accessLevels = restaurantDoc?.accessLevels || {}
    const restaurantName = restaurantDoc?.restaurantName

    return { accessLevels, restaurantName }
  } catch (e) {
    console.error(e)
    return { accessLevels: [], restaurantName: 'Unknown Restaurant' }
  }
}

type Props = {
  params: { restaurant: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const restaurantId = params.restaurant
  const { accessLevels, restaurantName } = await getMetadataData(restaurantId)
  const accessLevelImages = Object.values(accessLevels).map(details => details.image)
  const strippedAccessLevelImages = accessLevelImages.map(imageUrl =>
    imageUrl.replace(/^https:\/\/images\.blackbird\.xyz/, '')
  )
  const concatenatedImages = strippedAccessLevelImages.join(',')

  const rootUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fly.town'
  const ogUrl = `${rootUrl}/api/og?restaurantName=${restaurantName}&imageUrls=${concatenatedImages}`

  return {
    openGraph: {
      title: `${restaurantName} - fly.town`,
      description: `${restaurantName}'s profile on fly.town`,
      url: `https://fly.town/${restaurantId}`,
      siteName: 'fly.town',
      images: ogUrl,
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default async function RestaurantPage({ params }: { params: { restaurant: string } }) {
  const { restaurant: restaurantId } = params

  const restaurantData = await getData(restaurantId)
  if (!restaurantData) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center overflow-hidden pb-14 sm:pb-24 bg-[#0b0b0b] relative">
        <Navbar />
        <div>Restaurant not found</div>
      </main>
    )
  }
  const {
    restaurantName,
    location,
    checkinCount,
    firstCheckinDate,
    mostRecentCheckinDate,
    checkinsLast24h,
    checkinsLastMonth,
    numberOfMemberships,
    averageCheckinsPerMembership,
    accessLevels,
  } = restaurantData

  const iconSize = 24

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex w-full flex-col justify-center gap-5 pt-14 sm:gap-10 sm:pt-32">
        <div className="w-full sm:max-w-8xl mx-auto">
          <RestaurantTitleSection
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            subtitle={`${checkinCount.toLocaleString()} lifetime check ins`}
          />
          <p className="text-center text-gray-400 text-sm sm:text-base pb-4 sm:pb-8">{location}</p>
          <MembershipsSection accessLevels={accessLevels} restaurantId={restaurantId} />
          <div className="text-gray-200 pt-8 sm:pt-10 max-w-3xl mx-auto px-2 sm:px-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard title="First check in" statText={firstCheckinDate ? formatDistanceToNow(new Date(firstCheckinDate), { addSuffix: true }) : 'N/A'}>
                <Flag size={iconSize} />
              </StatCard>
              <StatCard
                title="Most recent check in"
                statText={mostRecentCheckinDate ? formatDistanceToNow(new Date(mostRecentCheckinDate), { addSuffix: true }) : 'N/A'}
              >
                <Nfc size={iconSize} />
              </StatCard>
              <StatCard title="Last 24h check ins" statText={checkinsLast24h.toLocaleString()}>
                <Clock size={iconSize} />
              </StatCard>
              <StatCard title="Last 30d check ins" statText={checkinsLastMonth.toLocaleString()}>
                <CalendarDays size={iconSize} />
              </StatCard>
              <StatCard title="Members" statText={numberOfMemberships.toLocaleString()}>
                <PersonStanding size={iconSize} />
              </StatCard>
              <StatCard title="Check ins per member" statText={averageCheckinsPerMembership.toFixed(2)}>
                <Stamp size={iconSize} />
              </StatCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
