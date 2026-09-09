import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { SITE_URL } from "@/lib/site";
import NavigationProgress from "@/components/NavigationProgress";

/**
 * Pretendard (SIL OFL 1.1) — 동적 서브셋.
 * 가변 폰트 전체는 2MB라 한글 사이트에 부담이라, 브라우저가 실제 쓰는
 * 유니코드 구간만 30KB 내외로 받아가는 dynamic-subset 배포본을 쓴다.
 */
const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css";

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
  metadataBase: new URL(SITE_URL),
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
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={PRETENDARD_CSS} />
        {/*
          기본값이 라이트이므로, 다크를 선택한 방문자가 흰 화면을 한 번 보고
          어두워지는 깜빡임이 생긴다. 페인트 전에 저장된 테마를 먼저 적용한다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}',
          }}
        />
      </head>
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
