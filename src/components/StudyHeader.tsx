"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { useTheme } from "@/components/ThemeProvider";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import type { StudyCategory } from "@/lib/study";

/**
 * 공부 블로그 전용 헤더. 기술 블로그와 같은 공간을 쓰지 않는 대신,
 * 왼쪽에 기술 블로그로 건너가는 길만 남겨 둔다.
 */
export default function StudyHeader({ categories }: { categories: StudyCategory[] }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isAll = pathname === "/study";

  return (
    <header className="border-b border-border-color bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-3">
          <Link href="/study" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/images/img.jpg"
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="font-semibold text-[15px] text-text-primary tracking-tight">
              공부 블로그
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label="테마 전환"
              className="flex items-center p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              {theme === "dark" ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
            </button>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors whitespace-nowrap"
            >
              <HiOutlineArrowLeft size={13} />
              기술 블로그
            </Link>
          </div>
        </div>

        {/* 카테고리 칩 — 공부 블로그는 셋뿐이라 펼쳐 두는 편이 빠르다 */}
        <nav className="flex items-center gap-2 pb-3 overflow-x-auto">
          <Link
            href="/study"
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] transition-colors ${
              isAll
                ? "bg-accent text-white font-medium"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            전체
          </Link>
          {categories.map((category) => {
            const href = `/study/category/${category.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={category.id}
                href={href}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                  active
                    ? "bg-accent text-white font-medium"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                {category.name}
                {category.count > 0 && (
                  <span className={`ml-1.5 tabular-nums ${active ? "opacity-80" : "text-text-tertiary"}`}>
                    {category.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
