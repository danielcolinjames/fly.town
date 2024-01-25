import Image from "next/image";
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://light-bass-33631.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN ?? '',
})

type flycastEntry = {
  count: number,
  timestamp: string
}

function getEasternTimeDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
  const easternTimeOffset = -5; // Eastern Time offset from UTC
  return new Date(utc + (3600000 * easternTimeOffset));
}

async function getData() {
  const todayKey = getEasternTimeDate().toISOString().split('T')[0]; // Format: "%Y-%m-%d"
  const flycastArray: flycastEntry[] = await redis.get(todayKey) || [];

  if (flycastArray.length === 0) {
    return {
      count: undefined,
      timestamp: undefined
    }
  }

  // Create an object to store the frequency of each count
  const countFrequency: { [key: number]: number } = {};
  flycastArray.forEach((flycast: flycastEntry) => {
    if (countFrequency[flycast.count]) {
      countFrequency[flycast.count]++;
    } else {
      countFrequency[flycast.count] = 1;
    }
  });

  // Find the count with the highest frequency (mode)
  let modeCount = undefined;
  let maxFrequency = 0;
  for (const count in countFrequency) {
    if (countFrequency[count] > maxFrequency) {
      maxFrequency = countFrequency[count];
      modeCount = Number(count);
    }
  }

  // Get latest timestamp
  let latestTimestamp = new Date(0); // Epoch
  flycastArray.map((flycast: flycastEntry) => {
    const currentTimestamp = new Date(flycast.timestamp);
    if (currentTimestamp > latestTimestamp) {
      latestTimestamp = currentTimestamp;
    }
  });

  const averageCount = modeCount;

  const etTimestamp = latestTimestamp;

  return {
    count: averageCount,
    timestamp: etTimestamp
  };
}

export default async function Home() {
  const data = await getData()
  const count = data?.count ?? undefined
  const timestamp = data?.timestamp ?? undefined

  // Convert the latest timestamp from Redis data for display
  let latestTime;
  if (timestamp) {
    latestTime = new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/^0+/, '');
  }

  const today = getEasternTimeDate().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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
        {count ?
          <div className="relative flex w-full flex-col justify-center gap-4 pt-20 md:pt-56">
            <h1 className="text-center text-6xl font-normal tracking-tighter sm:text-8xl">
              {count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div className='flex flex-col justify-center gap-2'>
              <h2 className="text-center text-2xl font-thin tracking-tighter md:text-2xl">
                is the FLYcast for today, {today}
              </h2>
              <p className="text-center text-sm text-gray-600">
                Last updated at {latestTime} ET
              </p>
            </div>
          </div>
          :
          <div className="relative flex w-full flex-col justify-center pt-20 md:pt-56">
            <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 md:text-2xl">
              No FLYcast submitted yet for {today}
            </h2>
          </div>
        }
      </div>

      <div className="absolute bottom-0 px-4 pb-4">
        <p className="text-center text-sm text-gray-600">
          fly.town is not endorsed by or associated with Blackbird Labs Inc.,
        </p>
        <p className="text-center text-sm text-gray-600">
          just made by a huge Blackbird fan (@dcj on Discord and @dcwj on 𝕏)
        </p>
      </div>
    </main>
  )
}
