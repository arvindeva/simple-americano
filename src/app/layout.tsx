import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import { Quantico } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ThemedTopLoader from "@/components/ThemedTopLoader";
import { Toaster } from "@/components/ui/sonner";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const quantico = Quantico({
  variable: "--font-quantico",
  subsets: ["latin"],
  weight: ["400", "700"], // Quantico has regular and bold weights
});

export const metadata: Metadata = {
  title: {
    default: "Americano Padel - Tournament Organizer",
    template: "%s | Americano Padel"
  },
  description: "Create fair and balanced padel tournaments with our smart match generation algorithm. Perfect for organizing Americano-style tournaments with friends.",
  keywords: ["padel", "tournament", "americano", "sports", "matches", "organizer", "fair play", "tournament bracket"],
  authors: [{ name: "Americano Padel Team" }],
  creator: "Americano Padel",
  publisher: "Americano Padel",
  category: "Sports",
  manifest: "/manifest.json",
  metadataBase: new URL("https://simple-americano.vercel.app"),
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://simple-americano.vercel.app",
    siteName: "Americano Padel",
    title: "Americano Padel - Tournament Organizer",
    description: "Create fair and balanced padel tournaments with our smart match generation algorithm. Perfect for organizing Americano-style tournaments with friends.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Americano Padel Tournament Organizer",
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary",
    title: "Americano Padel - Tournament Organizer",
    description: "Create fair and balanced padel tournaments with our smart match generation algorithm.",
    images: ["/android-chrome-512x512.png"],
    creator: "@americanopadel",
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
  },

  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Americano Padel",
    startupImage: "/android-chrome-512x512.png",
  },

  // Other
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Americano Padel",
    "alternateName": "Americano Padel Tournament Organizer",
    "description": "Create fair and balanced padel tournaments with our smart match generation algorithm. Perfect for organizing Americano-style tournaments with friends.",
    "url": "https://simple-americano.vercel.app",
    "applicationCategory": "SportsApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "Americano Padel Team"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Fair match generation algorithm",
      "Tournament organization",
      "Score tracking",
      "Player management",
      "Session sharing",
      "Mobile-friendly interface"
    ],
    "screenshot": "https://simple-americano.vercel.app/android-chrome-512x512.png",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${barlow.variable} ${quantico.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemedTopLoader />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
