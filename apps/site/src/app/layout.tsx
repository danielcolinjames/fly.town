import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'fly.town',
  description: 'What’s the FLYcast today?',
  openGraph: {
    images: 'https://fly.town/og2.png',
  },
}

import localFont from 'next/font/local'

// Font files can be colocated inside of `app`
const satoshiFont = localFont({
  src: '../assets/fonts/Satoshi-Variable.ttf',
  display: 'swap',
  variable: '--font-satoshi',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={satoshiFont.variable}>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" content="#000000" />
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
