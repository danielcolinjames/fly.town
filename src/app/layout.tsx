import type { Metadata } from 'next'
import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'fly.town',
  description: 'What’s the FLYcast today?',
  openGraph: {
    images: 'https://fly.town/og.png',
  },
}

import localFont from 'next/font/local'

// Font files can be colocated inside of `app`
const satoshiFont = localFont({
  src: '../assets/fonts/Satoshi-Variable.ttf',
  display: 'swap',
  variable: '--font-satoshi',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={satoshiFont.variable}>
      <body>{children}</body>
    </html>
  )
}