"use client";

import TopBar from "./TopBar";
import SiteFooter from "./SiteFooter";

type Category = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  _count?: { posts: number };
};

export default function BlogLayoutClient({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: Category[];
}) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      {/* 푸터가 항상 화면 아래에 붙도록 본문이 남는 높이를 차지하게 한다 */}
      <div className="min-h-screen flex flex-col">
        <TopBar categories={categories} />
        <main
          id="main-content"
          className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
