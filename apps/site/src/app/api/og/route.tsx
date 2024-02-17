// import { ImageResponse } from 'next/og';
// // App router includes @vercel/og.
// // No need to install it.

// export const runtime = 'edge';

// export async function GET(request: Request) {
//   // const { searchParams } = new URL(request.url);
//   // const username = searchParams.get('username');
//   // if (!username) {
//   //   return new ImageResponse(<>Visit with &quot;?username=vercel&quot;</>, {
//   //     width: 1200,
//   //     height: 630,
//   //   });
//   // }

//   // Make sure the font exists in the specified path:
//   const fontData = await fetch(
//     new URL('../../../assets/fonts/Satoshi-Variable.ttf', import.meta.url),
//   ).then((res) => res.arrayBuffer());
//   return new ImageResponse(
//     (
//       <div
//         style={{
//           display: 'flex',
//           fontSize: 60,
//           color: 'black',
//           background: '#f6f6f6',
//           width: '100%',
//           height: '100%',
//           paddingTop: 50,
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <img
//           width="256"
//           height="256"
//           src={`https://github.com/danielcolinjames.png`}
//           style={{
//             borderRadius: 128,
//           }}
//         />
//         <p>github.com/username</p>
//       </div>
//     ),
//     {
//       width: 1200,
//       height: 630,
//       fonts: [
//         {
//           name: 'Satoshi-Variable',
//           data: fontData,
//           style: 'normal',
//         },
//       ],
//     },
//   );
// }

import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.



export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantName = searchParams.get('restaurantName');
  const imageUrls = searchParams.get('imageUrl');

  if (!restaurantName) {
    return new ImageResponse(<>Visit with &quot;?username=vercel&quot;</>, {
      width: 1200,
      height: 630,
    });
  }

  const fontData = await fetch(
    new URL('../../../assets/fonts/Satoshi-Black.otf', import.meta.url),
  ).then((res) => res.arrayBuffer());

  const username = 'danielcolinjames';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          color: 'white',
          background: 'black',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        <img
          width="256"
          height="256"
          src={`https://github.com/${username}.png`}
          style={{
            borderRadius: 128,
          }}
        />
        {restaurantName}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Satoshi-Bold',
          data: fontData,
          style: 'normal',
        },
      ],
    },
  );
}
