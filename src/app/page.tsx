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
  console.log("Current time:", now.toString());

  if (process.env.NODE_ENV === 'development') {
    // Use local dev time locally
    return now;
  } else {
    // Assume UTC in prod
    const easternTimeOffset = -5; // Adjust to -4 during Daylight Saving Time
    const utc = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
    return new Date(utc + easternTimeOffset * 3600000);
  }
}

async function getData() {
  const date = getEasternTimeDate();
  const todayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Format: "YYYY-MM-DD"
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
        {count ? (
          <div className="relative flex w-full flex-col justify-center gap-2 pt-20 md:gap-1 md:pt-56">
            <p className="text-center text-sm text-gray-600 md:text-base">
              {today}
            </p>
            <p className="text-center text-sm text-white md:text-lg">
              The FLYcast today is
            </p>
            <h1 className="text-center text-5xl font-normal tracking-tighter sm:text-7xl md:text-8xl">
              {count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div className='flex flex-col justify-center'>
              <p className="text-center text-sm text-gray-600 md:text-base">
                Last updated at {latestTime} ET
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex w-full flex-col justify-center pt-20 md:pt-56">
            <h2 className="text-center text-2xl italic tracking-tighter text-gray-500 md:text-2xl">
              No FLYcast submitted yet for {today}
            </h2>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 px-4 pb-4">
        <p className="text-center text-sm text-gray-600">
          fly.town is not endorsed by or associated with Blackbird Labs Inc., just made by a huge Blackbird fan (@dcj on Discord / <a className="text-gray-500" href="https://x.com/dcwj" target="_blank" rel="noopener noreferrer">@dcwj on 𝕏</a>)
        </p>
      </div>
    </main>
  )
}
