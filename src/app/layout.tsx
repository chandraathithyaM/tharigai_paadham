import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tharigai Paadham Footwear | Premium Footwear Collection",
    template: "%s | Tharigai Paadham Footwear",
  },
  description:
    "Shop premium footwear at Tharigai Paadham - Sneakers, Crocs, Slides, Formal Shoes, Casual Shoes, Running Shoes & more. Best prices with free shipping.",
  keywords: [
    "footwear",
    "shoes",
    "sneakers",
    "crocs",
    "slides",
    "formal shoes",
    "running shoes",
    "Tharigai Paadham",
    "Puliampatti",
    "online shoe store",
  ],
  authors: [{ name: "Tharigai Paadham Footwear" }],
  creator: "Tharigai Paadham Footwear",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Tharigai Paadham Footwear",
    title: "Tharigai Paadham Footwear | Premium Footwear Collection",
    description:
      "Shop premium footwear - Sneakers, Crocs, Slides, Formal Shoes & more. Best prices with free shipping.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tharigai Paadham Footwear",
    description: "Premium footwear collection with best prices.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tharigai Paadham",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
