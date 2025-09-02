import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Crypto Trading Bot Dashboard - Real-Time Analytics & Portfolio Management",
    template: "%s | Crypto Trading Bot Dashboard",
  },
  description:
    "Professional cryptocurrency trading bot dashboard with real-time analytics, portfolio tracking, P&L monitoring, and automated trading insights. Monitor ETH/WBNB positions, trades, and performance metrics.",
  keywords: [
    "cryptocurrency trading bot",
    "crypto dashboard",
    "trading analytics",
    "portfolio management",
    "automated trading",
    "ETH trading",
    "WBNB trading",
    "DeFi trading",
    "crypto P&L tracking",
    "real-time trading data",
  ],
  authors: [{ name: "Trading Bot Dashboard" }],
  creator: "Trading Bot Dashboard",
  publisher: "Trading Bot Dashboard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Crypto Trading Bot Dashboard - Real-Time Analytics & Portfolio Management",
    description:
      "Professional cryptocurrency trading bot dashboard with real-time analytics, portfolio tracking, and automated trading insights.",
    siteName: "Crypto Trading Bot Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Crypto Trading Bot Dashboard - Real-Time Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Trading Bot Dashboard - Real-Time Analytics",
    description: "Professional cryptocurrency trading bot dashboard with real-time analytics and portfolio tracking.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "finance",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Crypto Trading Bot Dashboard",
              description:
                "Professional cryptocurrency trading bot dashboard with real-time analytics, portfolio tracking, and automated trading insights.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Real-time trading analytics",
                "Portfolio management",
                "P&L tracking",
                "Automated trading insights",
                "Risk management tools",
              ],
            }),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`font-sans ${dmSans.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
