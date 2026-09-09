"use client";

import TopBar from "./TopBar";

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
      <div className="min-h-screen">
        <TopBar categories={categories} />
        <main
          id="main-content"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
        >
          {children}
        </main>
      </div>
    </>
  );
}
