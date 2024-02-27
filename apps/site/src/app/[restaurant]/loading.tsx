import { MembershipsSection } from "./components/MembershipsSection";
import { RestaurantTitleSection } from "./components/RestaurantTitleSection";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div
      className="flex w-full flex-col pb-14 sm:pb-32"
    // style={{ backgroundColor: `${highestValueKeyAccent}00` }}
    >
      <div className="relative flex w-full flex-col justify-center gap-5 pt-4 sm:gap-10 sm:pt-10">
        <div className="mx-auto w-full">
          <RestaurantTitleSection
            loading
          // restaurantId={restaurantId}
          // highestValueKeyAccent={highestValueKeyAccent}
          // restaurantName={restaurantName}
          // location={location}
          // subtitle={`${checkinCount.toLocaleString()} lifetime check ins`}
          />
          {/* <Heatmap checkInsData={checkInsHeatmapData} /> */}
          <MembershipsSection
            loading
          // accessLevels={accessLevels}
          // restaurantId={restaurantId}
          // highestValueKeyAccent={highestValueKeyAccent}
          />
        </div>
      </div>
    </div>
  )
}
