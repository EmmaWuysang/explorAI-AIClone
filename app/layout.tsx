import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ExplorAI - AI Clone',
  description: 'Your personalized AI companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

