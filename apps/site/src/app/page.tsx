import Image from "next/image";
import { Redis } from '@upstash/redis';
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

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
      <Navbar />
      <div className="flex w-full flex-col px-8">
        {count ? (
          <div className="relative flex w-full flex-col justify-center gap-5 pt-20 md:gap-10 md:pt-32">
            <div className='flex flex-col justify-center gap-0 md:gap-2'>
              <p className="text-center text-2xl text-white md:text-5xl">
                Today’s FLYcast
              </p>
              <p className="text-center text-lg text-gray-600 md:text-2xl">
                {today}
              </p>
            </div>
            <div className='flex flex-col justify-center gap-1 md:gap-2'>
              <h1 className="text-center text-5xl font-medium tracking-tighter sm:text-7xl md:text-8xl">
                {count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className='flex flex-col justify-center gap-4'>
                <p className="text-center text-lg text-white md:text-2xl">
                  FLY per check in
                </p>
                <p className="text-center text-sm text-gray-600 md:text-base">
                  Last updated at {latestTime} ET
                </p>
              </div>
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
      <Footer />
    </main>
  )
}
