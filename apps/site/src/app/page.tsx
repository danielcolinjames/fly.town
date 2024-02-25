import React from "react";
import { Nfc, PersonStanding, Rocket } from "lucide-react";
import { RestaurantCardsContainer } from "./components/RestaurantCardsContainer";
import {
  getTopRestaurantsLast24Hours,
  getTotalCheckInsForRange,
} from "./data/restaurants";
import {
  getHomePageData,
  getTotalMembershipsCount,
} from "./lib/fetchHomePageData";

export default async function Home() {
  const data = await getHomePageData();
  const count = data?.count ?? undefined;
  // const timestamp = data?.timestamp ?? undefined

  const { topRestaurants, endOfRange, startOfRange } =
    await getTopRestaurantsLast24Hours();
  // const mostRecentCheckin = await getMostRecentCheckin()

  // const totalCheckins = mostRecentCheckin?.checkinId ? mostRecentCheckin.checkinId : 0
  // const totalUpdatedAt = mostRecentCheckin?.date
  //   ? new Date(mostRecentCheckin.date)
  //     .toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true,
  //     })
  //     .replace(/^0+/, '')
  //   : undefined

  const totalMembershipsCount = await getTotalMembershipsCount();

  // Convert the latest timestamp from Redis data for display
  // let latestTime
  // if (timestamp) {
  //   latestTime = new Date(timestamp)
  //     .toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true,
  //     })
  //     .replace(/^0+/, '')
  // }

  // const today = getEasternTimeDate().toLocaleDateString('en-US', {
  //   weekday: 'long',
  //   month: 'long',
  //   day: 'numeric',
  // })

  // Note: The incoming date is assumed to be in UTC. The displayed times for startOfRange and endOfRange will also be in UTC for consistency.
  const formatEndRangeUTC = (date: Date) => {
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
  };

  const adjustedSubtitleUTC = `By check ins between ${formatEndRangeUTC(startOfRange)} 5AM ET — ${formatEndRangeUTC(endOfRange)} 5AM ET`;
  const totalCheckinsToday = await getTotalCheckInsForRange();

  // const flycast = count

  // const countInteger = Math.floor(flycast ?? 0)
  // const countDecimal = (flycast ?? 0 - countInteger).toFixed(2).split('.')[1]

  return (
    <div className="flex w-full flex-col pb-14 sm:pb-32">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-between mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 px-4 pt-10 w-full max-w-sm sm:max-w-lg md:max-w-4xl">
            {count && (
              <GlobalStatCard
                title="$FLY per check in today"
                statText={`${count}`}
                icon={<Rocket />}
              />
            )}
            <GlobalStatCard
              title="Total check ins today"
              statText={`${totalCheckinsToday.totalCheckIns.toLocaleString()}`}
              icon={<Nfc />}
            />
            <GlobalStatCard
              title="Total memberships"
              statText={`${totalMembershipsCount.toLocaleString()}`}
              icon={<PersonStanding />}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <RestaurantCardsContainer
          restaurants={topRestaurants}
          title="Top restaurants"
          subtitle={adjustedSubtitleUTC}
        />
      </div>
    </div>
  );
}

const GlobalStatCard = ({
  title,
  statText,
  icon,
}: {
  title: string;
  statText: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-[#070707] border-[#202020] border-y w-full text-white px-4 py-5 rounded-xl min-w-[80px] sm:min-w-[225px]">
      <div className="flex flex-col w-full gap-1">
        {/* {icon} */}
        <p className="text-center text-sm text-[#727272] w-full">{title}</p>
        <h1 className="text-center text-white font-light tracking-tighter text-3xl sm:text-5xl">
          {statText}
        </h1>
      </div>
    </div>
  );
};
