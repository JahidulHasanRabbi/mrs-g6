import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * ---------------------------------------------------------------------------
 * IMPORTANT NOTICE TO ALL DEVELOPERS: DATE FORMAT CONVENTION
 * ---------------------------------------------------------------------------
 * Across this entire application, you MUST follow this format for date and time:
 *   dd/mm/yyyy HH:MM AM|PM
 * 
 * If displaying only the month and year, use:
 *   mm/yyyy
 * 
 * If displaying only the year, use:
 *   yyyy
 * ---------------------------------------------------------------------------
 */

import { UserProvider } from "./contexts/UserContext";
import LayoutShell from "./LayoutShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VIP Access | Claim Your Elite Benefits & Rewards",
  description: "Access your exclusive member dashboard. Log in now to claim your daily benefits, unlock rewards, and compete in our latest mini-games!",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        <UserProvider>
          <LayoutShell>{children}</LayoutShell>
        </UserProvider>
      </body>
    </html>
  );
}
