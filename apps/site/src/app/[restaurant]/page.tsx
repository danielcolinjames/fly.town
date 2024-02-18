import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'
import { AccessLevelDetails, getData } from './getData'
import Image from 'next/image'
import { CalendarDays, Clock, Clock1, Flag, GroupIcon, LucideIcon, Nfc, PersonStanding, Stamp } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { ReactNode } from 'react'
import Link from 'next/link'
import { MembershipsSection } from './components/MembershipsSection'
import { RestaurantTitleSection } from './components/RestaurantTitleSection'

async function getMetadataData(
  restaurantId: string
): Promise<{ accessLevels: AccessLevelDetails[]; restaurantName: string }> {
  try {
    const client = await clientPromise
    const db = client.db('flytown')

    const restaurantDoc = await db.collection('restaurants').findOne({ restaurant_id: restaurantId })
    const accessLevels = restaurantDoc?.accessLevels || {}
    const restaurantName = restaurantDoc?.full_name || 'Unknown Restaurant'

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
      url: 'https://fly.town',
      siteName: 'fly.town',
      images: ogUrl,
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default async function RestaurantPage({ params }: { params: { restaurant: string } }) {
  const { restaurant: restaurantId } = params

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

  const iconSize = 24

  return (
    <main className="flex min-h-screen w-full flex-col items-center overflow-hidden pb-10 sm:pb-12 bg-[#0b0b0b]">
      <Navbar />
      <div className="flex w-full flex-col">
        <div className="relative flex w-full flex-col justify-center gap-5 pt-14 sm:gap-10 sm:pt-32">
          <div className="w-full sm:max-w-8xl mx-auto">
            <RestaurantTitleSection
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              checkinCount={checkinCount}
            />
            <MembershipsSection accessLevels={accessLevels} restaurantId={restaurantId} />
            <div className="text-gray-200 pt-8 sm:pt-10 max-w-3xl mx-auto px-2 sm:px-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard title="First check in" statText={firstCheckinDate ? formatDate(firstCheckinDate) : 'N/A'}>
                  <Flag size={iconSize} />
                </StatCard>
                <StatCard
                  title="Most recent check in"
                  statText={mostRecentCheckinDate ? formatDate(mostRecentCheckinDate) : 'N/A'}
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
      <Footer />
    </main>
  )
}

const StatCard = ({ title, statText, children }: { title: string; statText: string; children: ReactNode }) => {
  return (
    <div
      className="flex flex-row gap-4 items-center justify-start px-4 py-4 duration-200 transition-all rounded-full
      bg-[#0a0a0a] border-[#202020] border"
    >
      <div className="p-4 bg-[#181818] rounded-full">
        <div className="text-gray-400">{children}</div>
      </div>
      <div className="flex flex-col items-start justify-center">
        <p className="text-gray-400 text-base font-light">{title}</p>
        <p className="text-white text-base font-semibold">{statText}</p>
      </div>
    </div>
  )
}
