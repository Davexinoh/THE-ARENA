import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Arena',
  description: 'AI-powered escrow arbitration on Hedera',
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
