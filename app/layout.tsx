import React from "react"
import type { Metadata } from 'next'
import { EB_Garamond, Great_Vibes } from 'next/font/google'

import './globals.css'

const ebGaramond = EB_Garamond({ 
  subsets: ['latin'],
  variable: '--font-serif',
})

const greatVibes = Great_Vibes({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cursive',
})

export const metadata: Metadata = {
  title: 'Kiran Ojha - CV',
  description: 'Fullstack Software Developer - React, React Native, NodeJS',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${ebGaramond.variable} ${greatVibes.variable} font-serif antialiased`}>{children}</body>
    </html>
  )
}
