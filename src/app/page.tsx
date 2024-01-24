import Image from "next/image";
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://light-bass-33631.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN ?? '',
})

async function getData() {
  const todayKey = new Date().toISOString().split('T')[0]; // Format: "%Y-%m-%d"
  const flycast = await redis.get(todayKey);

  if (flycast === null) {
    return {
      count: null,
      timestamp: null
    }
  }

  return flycast
}

export default async function Home() {
  // const todayFlycast = 1361.73
  // const hardcodedTimestamp = new Date('2023-03-01T12:00:00Z')

  const { count, timestamp } = await getData()
  const utcDate = new Date(timestamp + ' UTC');
  const latestTime = utcDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/^0+/, '');

  // const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/^0+/, '')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      <div className="flex w-full flex-col px-4 sm:px-10">
        {/* NavBar */}
        <div className="z-10 flex w-full items-center justify-between pt-4 text-sm sm:pt-10">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.png" className="w-8" height={23} width={19} alt="flytown logo" />
            <p className="text-3xl">
              fly
              <span className='text-gray-400'>
                .town
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col px-8">
        {count === null ?
          <div className="relative flex w-full flex-col justify-center pt-20 md:pt-56">
            <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 md:text-2xl">
              No FLYcast submitted yet for {today}
            </h2>
          </div>
          :
          <div className="relative flex w-full flex-col justify-center gap-4 pt-20 md:pt-56">
            <h1 className="text-center text-6xl font-normal tracking-tighter sm:text-8xl">
              {count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <h2 className="text-center text-2xl font-thin tracking-tighter md:text-2xl">
              is the FLYcast as of {latestTime} on {today}
            </h2>
          </div>
        }
      </div>

      <div className="absolute bottom-0 px-4 pb-4">
        <p className="text-center text-sm text-gray-600">
          This website is not endorsed by or associated with Blackbird Labs Inc., it‘s just made by a huge Blackbird fan (@dcj on Blackbird Discord)
        </p>
      </div>
    </main>
  )
}
