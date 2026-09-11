"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { StudySubCategory } from "@/lib/study";

/** 카테고리 페이지 상단의 하위 카테고리 칩. 이름이 언어에 따라 갈려 클라이언트에서 그린다. */
export default function StudySubCategories({ items }: { items: StudySubCategory[] }) {
  const { locale } = useI18n();
  if (items.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-2 mb-6 sm:mb-8">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/study/category/${item.slug}`}
          className="px-3 py-1.5 rounded-full text-[13px] bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          {locale === "en" && item.nameEn ? item.nameEn : item.name}
          {item.count > 0 && (
            <span className="ml-1.5 text-text-tertiary tabular-nums">{item.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
