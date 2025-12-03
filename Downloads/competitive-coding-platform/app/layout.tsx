import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

const siteUrl = "https://shastra.dev"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/Light.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  title: {
    default: "SHASTRA | Master Competitive Programming & Ace Coding Interviews",
    template: "%s | SHASTRA",
  },
  description:
    "SHASTRA is the ultimate competitive coding platform. Practice 2500+ algorithm problems, compete in live contests, track your progress, and prepare for technical interviews at top tech companies.",
  keywords: [
    "competitive programming",
    "coding contests",
    "algorithm practice",
    "data structures",
    "coding interview preparation",
    "LeetCode alternative",
    "online judge",
    "programming challenges",
    "tech interview prep",
    "SHASTRA",
    "learn algorithms",
    "coding competition",
  ],
  authors: [{ name: "SHASTRA", url: siteUrl }],
  creator: "SHASTRA",
  publisher: "SHASTRA",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SHASTRA",
    title: "SHASTRA | Master Competitive Programming & Ace Coding Interviews",
    description:
      "Practice 2500+ algorithm problems, compete in live contests, and prepare for technical interviews at Google, Amazon, Microsoft & more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SHASTRA - Competitive Coding Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHASTRA | Master Competitive Programming",
    description:
      "Practice algorithms, compete in contests, and ace your coding interviews.",
    images: ["/og-image.png"],
    creator: "@shaaborers",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#2E3A8C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {/* Skip to main content - Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-secondary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <Toaster position="top-center" richColors closeButton />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  )
}
