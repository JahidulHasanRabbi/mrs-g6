import { Inter, Geist, Geist_Mono, Montserrat, DM_Sans, JetBrains_Mono, Sora, Chakra_Petch, Rajdhani, Acme, Rubik, Berkshire_Swash, Lexend } from "next/font/google";
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
import Contentsquare from "./components/analytics/Contentsquare";
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
  weight: ["400"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Acebet77 theme fonts (see app/config/themes.js)
const berkshireSwash = Berkshire_Swash({
  variable: "--font-berkshire-swash",
  subsets: ["latin"],
  weight: ["400"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${sora.variable} ${chakraPetch.variable} ${rajdhani.variable} ${acme.variable} ${rubik.variable} ${berkshireSwash.variable} ${lexend.variable} antialiased bg-black`}
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        {/* Pre-hydration theme stamp: mirrors app/config/themes.js so a
            returning themed member never sees a default-theme flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var o=(localStorage.getItem('mrs_redirect_o')||'').toLowerCase();var t='default';if(o.indexOf('acebet77')>-1)t='acebet77';else if(o.indexOf('ubetclub')>-1)t='ubetclub';else if(o.indexOf('ep369')>-1)t='ep369';else if(o.indexOf('kgame99')>-1)t='kgame99';else if(o.indexOf('lv918')>-1)t='lv918';else if(o.indexOf('n1gang')>-1)t='n1gang';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <Contentsquare />
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
