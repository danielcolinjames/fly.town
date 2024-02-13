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

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      <Navbar />
      <div className="flex w-full flex-col px-8">
        <div className="relative flex w-full flex-col justify-center gap-2 pt-20 md:gap-1 md:pt-56">
          <p className="text-center text-sm text-white md:text-lg">
            Data:
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
