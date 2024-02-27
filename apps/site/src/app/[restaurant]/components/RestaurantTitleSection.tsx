// 'use client'
import { parseDetailedLocations } from "@/app/lib/locations";
import { LocateFixedIcon, LocateIcon, MapPin, Pin } from "lucide-react";
import Link from "next/link";
// import { motion } from 'framer-motion'

export const RestaurantTitleSection = ({
  restaurantName,
  restaurantId,
  subtitle,
  location,
  highestValueKeyAccent,
  loading,
}: {
  restaurantName?: string;
  restaurantId?: string;
  subtitle?: string;
  location?: string;
  highestValueKeyAccent?: string;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 pb-4 sm:pb-10 max-w-3xl mx-auto px-8">
        <Link
          href="/"
          className="block text-sm sm:text-base duration-150 transition-all pt-4 w-auto hover:opacity-50"
        // style={{ color: highestValueKeyAccent }}
        >
          &larr; Top 10
        </Link>
        <span className="bg-[#252525] rounded-md animate-pulse w-auto">
          <span className="text-5xl sm:text-7xl text-transparent rounded-xl animate-pulse w-auto">
            Restaurant Name
          </span>
        </span>
        <div className="flex flex-col justify-center gap-1 rounded-full">
          <div className="flex flex-col gap-1">
            <div
              className="flex flex-row items-center gap-1 sm:gap-2 bg-[#252525] rounded-md animate-pulse w-auto"
            >
              <MapPin
                className="text-transparent size-4 sm:size-5"
              // style={{ color: highestValueKeyAccent }}
              />
              <span
                // style={{ color: highestValueKeyAccent }}
                className="text-base sm:text-xl text-transparent w-auto"
              >
                123 Address, NY
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const parsedLocations = parseDetailedLocations(location ?? 'Location');

  return (
    <div className="flex flex-col gap-4 pb-4 sm:pb-10 max-w-3xl mx-auto px-8">
      <Link
        href="/"
        className="block text-sm sm:text-base duration-150 transition-all pt-4 w-auto hover:opacity-50"
        style={{ color: highestValueKeyAccent }}
      >
        &larr; Top 10
      </Link>
      <span className="text-left text-5xl text-white sm:text-7xl">
        {restaurantName}
      </span>
      {subtitle && (
        <p className="text-left text-xl text-[#B5B5B5] sm:text-2xl">
          {subtitle}
        </p>
      )}
      <div className="flex flex-col justify-center gap-1 rounded-full">
        {parsedLocations.length > 1 && (
          <div className="flex flex-row items-center">
            <span className="text-[#727272] text-sm sm:text-lg">
              {parsedLocations.length} locations
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {parsedLocations.map((location) => {
            return (
              <div
                className="flex flex-row items-center gap-1 sm:gap-2"
                key={location.streetAddress}
              >
                <MapPin
                  className="text-[#727272] size-4 sm:size-5"
                  style={{ color: highestValueKeyAccent }}
                />
                <span
                  style={{ color: highestValueKeyAccent }}
                  key={location.streetAddress}
                  className="text-[#727272] text-base sm:text-xl"
                >
                  {location.streetAddress}, {location.state}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
