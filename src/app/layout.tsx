import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const GA_ID = "G-K7XWPMT3FW";

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
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "My Blog",
    template: "%s | My Blog",
  },
  description: "개발, 기술, 일상을 기록하는 개인 블로그",
  openGraph: {
    title: "My Blog",
    description: "개발, 기술, 일상을 기록하는 개인 블로그",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
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
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
