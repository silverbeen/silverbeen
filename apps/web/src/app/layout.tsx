import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { config } from "@/config";
import "@silverbeen/ui/styles/globals.css";
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
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${config.siteName} | Resume & Blog`,
    template: `%s | ${config.siteName}`,
  },
  description: config.siteDescription,

  openGraph: {
    type: 'website',
    locale: config.locale,
    url: config.siteUrl,
    siteName: config.siteName,
    title: config.siteName,
    description: config.siteDescription,
    images: [
      {
        url: config.defaultOgImage,
        width: 1200,
        height: 630,
        alt: config.siteName,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: config.siteName,
    description: config.siteDescription,
    images: [config.defaultOgImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-[calc(100vh-8rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
