// 'use client'
import { AccessLevelDetails } from '../getData'
// import { motion } from 'framer-motion'

export const MembershipsSection = ({
  accessLevels,
  restaurantId,
  highestValueKeyAccent,
}: {
  accessLevels: AccessLevelDetails
  restaurantId: string
  highestValueKeyAccent: string
}) => {
  const totalWidth = 836
  const totalHeight = 630
  const numberOfImages = Object.keys(accessLevels).length

  const originalWidth = 343
  const originalHeight = 490
  const originalAspectRatio = originalWidth / originalHeight

  // Set imageHeight to match the totalHeight of the canvas
  let imageHeight = totalHeight // Ensure minimum image height is the canvas height
  // Calculate imageWidth based on the original aspect ratio
  let imageWidth = imageHeight * originalAspectRatio

  let marginLeft = 0

  if (numberOfImages === 1) {
    imageWidth = totalWidth / 2
    imageHeight = imageWidth / originalAspectRatio
  } else if (numberOfImages === 2) {
    // if total width of images is less than total width of canvas, we need to increase the width of the images to be equal to the proportion of the total canvas width they should take up
    imageWidth = totalWidth / numberOfImages
    imageHeight = imageWidth / originalAspectRatio
  } else if (numberOfImages > 2) {
    // Calculate the total width that all images would normally occupy without overlap
    const totalImageWidthWithoutOverlap = imageWidth * numberOfImages
    // Calculate the required overlap to make the images fit exactly within the totalWidth
    const requiredOverlapPerImage = (totalImageWidthWithoutOverlap - totalWidth) / (numberOfImages - 1)
    marginLeft = -requiredOverlapPerImage // Apply as negative margin to each image except the first
  }

  const { image, memberStatus, accent, whiteText } = accessLevels

  return (
    // <motion.div
    <div
      className="py-4 sm:py-10 bg-[#040404] border-y border-[#202020] w-full"
    // style={{ borderColor: `${highestValueKeyAccent}ff` }}
    // layoutId={`restaurant-card-${restaurantId}`}
    >
      <p className="text-left sm:pb-5 max-w-3xl mx-auto px-8 sm:text-center font-light text-xl sm:text-2xl flex flex-col pb-6 pt-2 text-[#727272]">
        Membership Tiers
      </p>
      <div className="flex flex-col md:flex-row justify-center items-start px-8 gap-8 sm:gap-4 w-full">
        {Object.entries(accessLevels).map(([level, details], index, { length }) => (
          <div key={index} className="rounded-lg shadow-xl gap-4" >
            {/* <motion.img */}
            <img
              src={details.image}
              alt={`Access Level ${level}`}
              // layoutId={index === length - 1 ? `membership-image-${details.image}` : ''}
              className="rounded-lg"
              width={imageWidth}
              height={imageHeight}
            // style={{ boxShadow: `0 0 110px ${details.accent}28` }}
            />
            <div className="flex flex-col items-center justify-center pt-0 sm:pt-2 gap-0 sm:gap-0">
              <p className="text-gray-700 justify-center text-left sm:text-center hover:text-brandYellow mt-1 transition-all duration-200">
                Artist: {details.imageArtist}
              </p>
              <div className="flex gap-2 justify-start sm:justify-center">
                <p className="text-gray-400 text-lg sm:text-xl font-light">{level}</p>
                <p className="text-white text-lg sm:text-xl font-semibold">{details.memberStatus}</p>
              </div>
              <p style={{ color: details.accent }} className="text-lg sm:text-xl font-light">{details.count.toLocaleString()} members</p>
            </div>
          </div>
        ))}
      </div>
      {/* </motion.div> */}
    </div>
  )
}
