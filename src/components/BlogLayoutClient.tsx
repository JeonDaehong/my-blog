"use client";

import { I18nProvider } from "@/lib/i18n";
import Sidebar from "./Sidebar";
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
    <I18nProvider>
      <div className="flex min-h-screen">
        <Sidebar categories={categories} />
        <div className="flex-1 lg:pl-[260px]">
          <TopBar />
          <main className="max-w-5xl mx-auto px-6 py-10">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
