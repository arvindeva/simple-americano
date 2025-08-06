import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import { Bangers } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ThemedTopLoader from "@/components/ThemedTopLoader";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: ["400"], // Bangers only has one weight
});

export const metadata: Metadata = {
  title: "Americano Padel",
  description: "Tournament organizer for fair and fun padel matches",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Americano Padel",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${barlow.variable} ${bangers.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemedTopLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
