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
