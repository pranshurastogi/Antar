import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { QueryProvider } from '@/lib/providers/query-provider'
import { ToasterProvider } from '@/lib/providers/toaster-provider'
import { Footer } from '@/components/footer'
import { CelebrationBurst, MobileFunIndicator } from '@/components/mobile/fun-elements'
import '@/lib/icons' // Initialize Font Awesome icon library
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'Antar - Habit Tracking & Self-Discovery',
  description: 'A minimalist yet powerful habit tracking application focused on self-discovery through habit formation. Build better habits, track your progress, and grow your inner self with Antar.',
  creator: 'Pranshu Rastogi',
  applicationName: 'Antar',
  keywords: ['habit tracking', 'productivity', 'self-improvement', 'habits', 'personal development'],
  authors: [{ name: 'Pranshu Rastogi' }],
  icons: {
    icon: [
      {
        url: '/logo-antar.png',
        type: 'image/png',
      },
    ],
    apple: '/logo-antar.png',
  },
  openGraph: {
    title: 'Antar - Habit Tracking & Self-Discovery',
    description: 'A minimalist yet powerful habit tracking application focused on self-discovery through habit formation.',
    type: 'website',
    siteName: 'Antar',
  },
  twitter: {
    card: 'summary',
    title: 'Antar - Habit Tracking & Self-Discovery',
    description: 'A minimalist yet powerful habit tracking application focused on self-discovery through habit formation.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <QueryProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <CelebrationBurst />
          <MobileFunIndicator />
          <ToasterProvider />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  )
}
