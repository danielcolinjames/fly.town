// 'use client'
import Image from "next/image";

import { AccessLevelDetails } from "../getData";
// import { motion } from 'framer-motion'

export const MembershipsSection = ({
  accessLevels,
  restaurantId,
  highestValueKeyAccent,
}: {
  accessLevels: AccessLevelDetails;
  restaurantId: string;
  highestValueKeyAccent: string;
}) => {
  const totalWidth = 836;
  const totalHeight = 630;
  const numberOfImages = Object.keys(accessLevels).length;

  const originalWidth = 343;
  const originalHeight = 490;
  const originalAspectRatio = originalWidth / originalHeight;

  // Set imageHeight to match the totalHeight of the canvas
  let imageHeight = totalHeight; // Ensure minimum image height is the canvas height
  // Calculate imageWidth based on the original aspect ratio
  let imageWidth = imageHeight * originalAspectRatio;

  let marginLeft = 0;

  if (numberOfImages === 1) {
    imageWidth = totalWidth / 2;
    imageHeight = imageWidth / originalAspectRatio;
  } else if (numberOfImages === 2) {
    // if total width of images is less than total width of canvas, we need to increase the width of the images to be equal to the proportion of the total canvas width they should take up
    imageWidth = totalWidth / numberOfImages;
    imageHeight = imageWidth / originalAspectRatio;
  } else if (numberOfImages > 2) {
    // Calculate the total width that all images would normally occupy without overlap
    const totalImageWidthWithoutOverlap = imageWidth * numberOfImages;
    // Calculate the required overlap to make the images fit exactly within the totalWidth
    const requiredOverlapPerImage =
      (totalImageWidthWithoutOverlap - totalWidth) / (numberOfImages - 1);
    marginLeft = -requiredOverlapPerImage; // Apply as negative margin to each image except the first
  }

  const { image, memberStatus, accent, whiteText } = accessLevels;

  return (
    // <motion.div
    <div
      className="w-full border-y border-[#202020] bg-[#040404] py-4 sm:py-10"
    // style={{ borderColor: `${highestValueKeyAccent}ff` }}
    // layoutId={`restaurant-card-${restaurantId}`}
    >
      <p className="mx-auto flex max-w-3xl flex-col px-8 pb-6 pt-2 text-left text-xl font-light text-[#727272] sm:pb-5 sm:text-center sm:text-2xl">
        Membership Tiers
      </p>
      <div className="flex w-full flex-col items-start justify-center gap-8 px-8 sm:gap-4 md:flex-row">
        {Object.entries(accessLevels).map(
          ([level, details], index, { length }) => (
            <div key={index} className="gap-4 rounded-lg shadow-xl">
              <Image
                src={details.image}
                alt={`Access Level ${level}`}
                // layoutId={index === length - 1 ? `membership-image-${details.image}` : ''}
                className="rounded-lg"
                width={imageWidth}
                height={imageHeight}
              // style={{ boxShadow: `0 0 110px ${details.accent}28` }}
              />
              <div className="flex flex-col items-center justify-center gap-0 pt-0 sm:gap-0 sm:pt-2">
                <p className="hover:text-brandYellow mt-1 justify-center text-left text-gray-700 transition-all duration-200 sm:text-center">
                  Artist: {details.imageArtist}
                </p>
                <div className="flex justify-start gap-2 sm:justify-center">
                  <p className="text-lg font-light text-[#B5B5B5] sm:text-xl">
                    {level}
                  </p>
                  <p className="text-lg font-semibold text-white sm:text-xl">
                    {details.memberStatus}
                  </p>
                </div>
                <p
                  style={{ color: details.accent }}
                  className="text-lg font-light sm:text-xl"
                >
                  {details.count.toLocaleString()} members
                </p>
              </div>
            </div>
          ),
        )}
      </div>
      {/* </motion.div> */}
    </div>
  );
};
