import clientPromise from '../../lib/mongodb'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'
import { AccessLevelDetails, getData } from './getData'
import Image from 'next/image'
import { Clock, LucideIcon } from 'lucide-react'

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
      title: '${restaurantName} - fly.town',
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

  const totalWidth = 836
  const totalHeight = 630
  const numberOfImages = Object.keys(accessLevels).length

  const originalWidth = 343
  const originalHeight = 490
  const originalAspectRatio = originalWidth / originalHeight

  // Set imageHeight to match the totalHeight of the canvas
  let imageHeight = totalHeight // Ensure minimum image height is the canvas height
  // Calculate imageWidth based on the original aspect ratio
  let imageWidth = imageHeight * originalAspectRatio

  let marginLeft = 0

  if (numberOfImages === 1) {
    imageWidth = totalWidth
    imageHeight = imageWidth / originalAspectRatio
  } else if (numberOfImages === 2) {
    // if total width of images is less than total width of canvas, we need to increase the width of the images to be equal to the proportion of the total canvas width they should take up
    imageWidth = totalWidth / numberOfImages
    imageHeight = imageWidth / originalAspectRatio
  } else if (numberOfImages > 2) {
    // Calculate the total width that all images would normally occupy without overlap
    const totalImageWidthWithoutOverlap = imageWidth * numberOfImages
    // Calculate the required overlap to make the images fit exactly within the totalWidth
    const requiredOverlapPerImage = (totalImageWidthWithoutOverlap - totalWidth) / (numberOfImages - 1)
    marginLeft = -requiredOverlapPerImage // Apply as negative margin to each image except the first
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center overflow-hidden pb-40 bg-[#0b0b0b]">
      <Navbar />
      <div className="flex w-full flex-col">
        <div className="relative flex w-full flex-col justify-center gap-5 pt-14 sm:gap-10 sm:pt-32">
          <div className="w-full sm:max-w-8xl mx-auto">
            <div className="flex flex-col justify-center gap-3 pb-10 sm:pb-8 max-w-3xl mx-auto px-8">
              <p className="text-left text-5xl text-white sm:text-7xl">{restaurantName}</p>
              <p className="text-left text-xl text-white sm:text-2xl">
                {checkinCount.toLocaleString()} lifetime check ins
              </p>
              <p className="text-sm text-gray-600">
                First check in: {firstCheckinDate ? new Date(firstCheckinDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="py-4 sm:py-10 bg-[#040404] w-full">
              <p className="text-left sm:pb-5 max-w-3xl mx-auto px-8 sm:text-center text-light text-2xl sm:text-2xl flex flex-col pb-4 text-gray-400">
                Membership Tiers
              </p>
              <div className="flex flex-col md:flex-row justify-center items-start px-8 gap-8 sm:gap-4 w-full">
                {Object.entries(accessLevels).map(([level, details], index) => (
                  <div key={index} className="rounded-lg shadow gap-4">
                    <Image
                      src={details.image}
                      alt={`Access Level ${level}`}
                      className="rounded-lg"
                      width={imageWidth}
                      height={imageHeight}
                    />
                    <p className="text-gray-700 justify-center text-left sm:text-center">
                      Artist: {details.imageArtist}
                    </p>
                    <div className="pt-0 sm:pt-2 gap-2">
                      <div className="flex gap-2 justify-start sm:justify-center">
                        <p className="text-gray-400 text-lg sm:text-xl font-light">{level}</p>
                        <p className="text-white text-lg sm:text-xl font-semibold">{details.memberStatus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-gray-200 pt-16 sm:pt-20 max-w-3xl mx-auto px-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                  title="First check in"
                  statText={firstCheckinDate ? new Date(firstCheckinDate).toLocaleDateString() : 'N/A'}
                />
                <StatCard
                  title="Most recent check in"
                  statText={mostRecentCheckinDate ? new Date(mostRecentCheckinDate).toLocaleDateString() : 'N/A'}
                />
                <StatCard title="Last 24h check ins" statText={checkinsLast24h.toLocaleString()} />
                <StatCard title="Last 30d check ins" statText={checkinsLastMonth.toLocaleString()} />
                <StatCard title="Number of members" statText={numberOfMemberships.toLocaleString()} />
                <StatCard title="Avg. check ins / member" statText={averageCheckinsPerMembership.toFixed(2)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

const StatCard = ({ title, statText }: { title: string; statText: string }) => {
  return (
    <div
      className="flex flex-col items-start justify-center px-4 sm:px-8 py-4 duration-200 transition-all rounded-full
    bg-[#0a0a0a] border-[#202020] border p-1"
    >
      <p className="text-gray-400 text-lg font-light">{title}</p>
      <p className="text-white text-2xl font-semibold">{statText}</p>
    </div>
  )
}
