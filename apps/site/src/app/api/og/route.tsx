import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantName = searchParams.get("restaurantName");
  const imageUrls = searchParams.get("imageUrls")?.split(",") || [];
  // const imageUrls = JSON.parse(searchParams.get('imageUrls') as string)

  // console.log('restaurantName', restaurantName);
  // console.log('imageUrls', imageUrls);

  const fullImageUrls = imageUrls.map(
    (url: string) => `https://images.blackbird.xyz${url}`,
  );

  if (!restaurantName) {
    return new ImageResponse(<>fly.town</>, {
      width: 1200,
      height: 630,
    });
  }

  const satoshiBoldFontData = await fetch(
    new URL("../../../assets/fonts/Satoshi-Black.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiRegularFontData = await fetch(
    new URL("../../../assets/fonts/Satoshi-Regular.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiLightFontData = await fetch(
    new URL("../../../assets/fonts/Satoshi-Light.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());
  // Assuming these values are defined as before
  const outerPadding = 50; // Padding around the image area

  const totalWidth = 1200;
  const totalHeight = 630;
  const numberOfImages = fullImageUrls.length;

  const originalWidth = 343;
  const originalHeight = 490;
  const originalAspectRatio = originalWidth / originalHeight;

  // Set imageHeight to match the totalHeight of the canvas
  let imageHeight = totalHeight; // Ensure minimum image height is the canvas height
  // Calculate imageWidth based on the original aspect ratio
  let imageWidth = imageHeight * originalAspectRatio;

  let marginLeft = 0;

  if (numberOfImages === 1) {
    imageWidth = totalWidth;
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

  // Now, use these calculated dimensions for the images
  return new ImageResponse(
    (
      <div tw="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-[#0b0b0b] flex items-center justify-center">
        <div tw="flex flex-col w-full h-full">
          <div tw="flex flex-row justify-center items-center w-full h-full">
            {fullImageUrls.map((url: string, index: number) => (
              <img
                key={url}
                width={imageWidth}
                height={imageHeight}
                src={url}
                style={{
                  width: `${imageWidth}px`,
                  height: `${imageHeight}px`,
                  position: "absolute",
                  left: `${index * (imageWidth + marginLeft)}px`, // Correctly calculate left position for each image
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
          <div tw="absolute top-0 right-0 bottom-0 left-0 bg-black bg-opacity-80" />
          <p
            tw="text-white absolute left-0 text-[100px] leading-[75px]"
            style={{
              fontFamily: "Satoshi-Regular",
              bottom: outerPadding,
              left: outerPadding,
            }}
          >
            {restaurantName}
          </p>
        </div>
        <div
          tw="absolute flex flex-row items-center flex"
          style={{ top: outerPadding, left: outerPadding }}
        >
          <img src="https://fly.town/logo2.png" tw="w-[75px] mr-[20px]" />
        </div>
      </div>
    ),
    {
      width: totalWidth,
      height: totalHeight,
      fonts: [
        {
          name: "Satoshi-Bold",
          data: satoshiBoldFontData,
          style: "normal",
        },
        {
          name: "Satoshi-Regular",
          data: satoshiRegularFontData,
          style: "normal",
        },
        {
          name: "Satoshi-Light",
          data: satoshiLightFontData,
          style: "normal",
        },
      ],
    },
  );
}
