import type { Metadata } from 'next'
import './globals.css'
import { fraunces, dmSans, jetbrainsMono } from './fonts'

export const metadata: Metadata = {
  title: "PlainSight — See what you're really signing",
  description: "Upload any contract. Get instant plain English translation, risk scoring, and what's missing — in seconds.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
