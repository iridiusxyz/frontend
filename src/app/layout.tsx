import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://iridius.xyz";
const TITLE = "Iridius | Real-world asset swaps on Robinhood Chain";
const DESCRIPTION =
  "Iridius is a swap venue on Robinhood Chain for tokenized real-world assets, and it never takes custody. Swap Stock Tokens for USDG at prices pinned to the live Chainlink mid, see the spread and fee listed on each ticket, and have each fill settled on-chain.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Iridius",
  },
  description: DESCRIPTION,
  applicationName: "Iridius",
  keywords: [
    "Iridius",
    "Robinhood Chain",
    "tokenized stocks",
    "RWA swap",
    "real-world assets",
    "USDG",
    "tokenized equities",
    "DeFi",
  ],
  authors: [{ name: "Iridius", url: SITE_URL }],
  creator: "Iridius",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Iridius",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@iridiusxyz",
    creator: "@iridiusxyz",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#05090f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceGrotesk.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-ir-void text-ir-fg antialiased">
        {children}
        <div className="noise" aria-hidden="true" />
      </body>
    </html>
  );
}
