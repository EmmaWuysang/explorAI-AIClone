import type { Metadata } from 'next'
import './globals.css'
import DemoResetButton from '@/components/ui/DemoResetButton'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: '(B)est Team - AI Assistant',
  description: 'Your AI-powered assistant',
}

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
        <DemoResetButton />
      </body>
    </html>
  )
}

