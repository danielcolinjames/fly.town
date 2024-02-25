import clientPromise from "@/lib/mongodb";
import { Redis } from "@upstash/redis";
import { SITE_DB_NAME } from "@/lib/utils";

const redis = new Redis({
  url: "https://light-bass-33631.upstash.io",
  token: process.env.UPSTASH_REDIS_TOKEN ?? "",
});

type flycastEntry = {
  count: number;
  timestamp: string;
};

export function getEasternTimeDate() {
  const now = new Date();
  // console.log('Current time:', now.toString())

  if (process.env.NODE_ENV === "development") {
    // Use local dev time locally
    return now;
  } else {
    // Assume UTC in prod
    const easternTimeOffset = -5; // Adjust to -4 during Daylight Saving Time
    const utc = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
    return new Date(utc + easternTimeOffset * 3600000);
  }
}

export async function getCheckinCountsByRestaurant() {
  const client = await clientPromise;
  const db = client.db(SITE_DB_NAME);

  const checkinCounts = await db
    .collection("checkIns")
    .aggregate([
      {
        $group: {
          _id: "$restaurantId", // Group by restaurantId
          totalCheckins: { $count: {} }, // Count the checkins per restaurant
        },
      },
      { $sort: { totalCheckins: -1 } }, // Sort by totalCheckins in descending order
    ])
    .toArray();

  return checkinCounts;
}

export async function getMostRecentCheckin() {
  const client = await clientPromise;
  const db = client.db(SITE_DB_NAME);

  const mostRecentCheckin = await db
    .collection("checkIns")
    .find()
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  if (mostRecentCheckin.length > 0) {
    const { checkInId, createdAt } = mostRecentCheckin[0];
    return {
      checkinId: checkInId,
      date: new Date(createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };
  }

  return null;
}

export async function getHomePageData() {
  const date = getEasternTimeDate();
  const todayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; // Format: "YYYY-MM-DD"
  const flycastArray: flycastEntry[] = (await redis.get(todayKey)) || [];

  if (flycastArray.length === 0) {
    return {
      count: undefined,
      timestamp: undefined,
    };
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
    timestamp: etTimestamp,
    // restaurants: restaurants,
  };
}

export async function getTotalMembershipsCount() {
  const client = await clientPromise;
  const db = client.db(SITE_DB_NAME);
  const totalMemberships = await db.collection("memberships").countDocuments();
  return totalMemberships;
}
