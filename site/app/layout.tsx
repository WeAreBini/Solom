/**
 * @ai-context Root layout with providers, fonts, skip-to-content, and responsive navigation.
 */
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { MobileNav } from "@/components/layout/MobileNav";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#17191e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Solom Finance",
    template: "%s | Solom Finance",
  },
  description:
    "Modern finance platform for tracking portfolios, market trends, insider trading, and economic indicators.",
  keywords: [
    "finance",
    "stocks",
    "portfolio",
    "market",
    "insider trading",
    "earnings",
    "13F",
  ],
  authors: [{ name: "Solom Team" }],
  creator: "Solom",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://solom.finance",
    title: "Solom Finance",
    description:
      "Modern finance platform for tracking portfolios, market trends, and insider trading.",
    siteName: "Solom Finance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solom Finance",
    description:
      "Modern finance platform for tracking portfolios, market trends, and insider trading.",
    creator: "@solomfinance",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Solom Finance",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Providers>
          <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main id="main-content" className="flex-1 overflow-y-auto bg-background">
                {children}
              </main>
              <RightPanel />
            </div>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}