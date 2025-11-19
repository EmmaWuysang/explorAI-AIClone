import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '(B)est Team - AI Assistant',
  description: 'Your AI-powered assistant',
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

