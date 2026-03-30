import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import NavigationProgress from "@/components/NavigationProgress";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-korean",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "대홍의 데이터 기록",
    template: "%s | 대홍의 데이터 기록",
  },
  description: "데이터 엔지니어링, 백엔드, 오픈소스를 기록하는 기술 블로그",
  metadataBase: new URL("https://daehong.dev"),
  openGraph: {
    title: "대홍의 데이터 기록",
    description: "데이터 엔지니어링, 백엔드, 오픈소스를 기록하는 기술 블로그",
    type: "website",
    locale: "ko_KR",
    siteName: "대홍의 데이터 기록",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  alternates: { types: { "application/rss+xml": "/feed" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${notoSansKR.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
