import { Inter, Geist, Geist_Mono, Montserrat, DM_Sans, JetBrains_Mono, Sora, Chakra_Petch, Rajdhani, Acme } from "next/font/google";
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

import LayoutShell from "./LayoutShell";
import { ToastProvider } from "./components/admin/ui/Toast";

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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

// RPG mini-game fonts (see app/components/rpg/constants.js RPG_FONTS)
const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const acme = Acme({
  variable: "--font-acme",
  subsets: ["latin"],
  weight: "400",
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
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${sora.variable} ${chakraPetch.variable} ${rajdhani.variable} ${acme.variable} antialiased bg-black`}
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
