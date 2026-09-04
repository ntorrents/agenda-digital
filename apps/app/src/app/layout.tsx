import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { PwaProvider } from '@/components/pwa/PwaProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Petit Diari',
    template: '%s | Petit Diari',
  },
  description:
    "El dia a dia a l'escola, a prop de la família. Registra l'alimentació, el son, l'estat d'ànim i més.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Petit Diari',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f766e',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <PwaProvider>{children}</PwaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
