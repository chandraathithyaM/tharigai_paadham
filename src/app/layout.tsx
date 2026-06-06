import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "தரிகை பாதம் | Eco-Conscious Premium Footwear",
    template: "%s | தரிகை பாதம்",
  },
  description:
    "Eco-conscious premium footwear rooted in Tamil heritage. Sustainable sneakers, handcrafted sandals, and nature-inspired designs — walk gently on earth with Tharigai Paadham.",
  keywords: [
    "eco footwear",
    "sustainable shoes",
    "Tamil brand",
    "Tharigai Paadham",
    "தரிகை பாதம்",
    "eco-friendly sneakers",
    "handcrafted sandals",
    "nature-inspired footwear",
    "Puliampatti",
    "premium footwear India",
  ],
  authors: [{ name: "தரிகை பாதம் — Tharigai Paadham" }],
  creator: "தரிகை பாதம்",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "தரிகை பாதம் — Tharigai Paadham",
    title: "தரிகை பாதம் | Eco-Conscious Premium Footwear",
    description:
      "Eco-conscious premium footwear rooted in Tamil heritage. Walk gently on earth with Tharigai Paadham.",
  },
  twitter: {
    card: "summary_large_image",
    title: "தரிகை பாதம் — Tharigai Paadham",
    description: "Eco-conscious premium footwear rooted in Tamil heritage.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "தரிகை பாதம்",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1f0a" },
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
        className={`${inter.variable} ${outfit.variable}`}
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
