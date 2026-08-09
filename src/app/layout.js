import "./globals.css";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ThemeProvider } from "./theme-provider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import VisitTracker from "./components/VisitTracker";
import MobileTabBar from "./components/MobileTabBar";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"],
});

export const metadata = {
  title: {
    default: "دایموند کالا | فروشگاه آنلاین لوازم آرایشی و بهداشتی",
    template: "%s | دایموند کالا",
  },
  description:
    "دایموند کالا، فروشگاه اینترنتی خرید آنلاین لوازم آرایشی و بهداشتی اورجینال، با ارسال سریع، بسته‌بندی ویژه و پرداخت امن از طریق درگاه بانکی.",
  keywords: ["لوازم آرایشی", "لوازم بهداشتی", "خرید آنلاین آرایشی", "دایموند کالا", "فروشگاه آرایشی بهداشتی"],
  openGraph: {
    title: "دایموند کالا | فروشگاه آنلاین لوازم آرایشی و بهداشتی",
    description: "خرید آنلاین لوازم آرایشی و بهداشتی اورجینال با ارسال سریع و پرداخت امن.",
    type: "website",
    locale: "fa_IR",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-base text-ink font-body min-h-screen flex flex-col"
        style={{ "--font-body": "'Vazirmatn', var(--font-display), sans-serif" }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Providers>
            <Navbar />
            <div className="flex-1 pb-20 lg:pb-0">{children}</div>
            <Footer />
            <ChatWidget />
            <VisitTracker />
            <MobileTabBar />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
