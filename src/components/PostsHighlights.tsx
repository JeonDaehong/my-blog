"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiChevronLeft, HiChevronRight, HiOutlineEye } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import type { PostSummary, PopularPost, GuestbookPreview } from "@/lib/types";

/**
 * 토스 테크의 상단 추천 영역에 해당한다. 자동 회전 캐러셀 대신 스크롤 스냅을
 * 쓴 이유는, 글이 두어 편일 때도 어색해지지 않고 손가락으로도 자연스럽기 때문이다.
 */
export function FeaturedRow({ posts }: { posts: PostSummary[] }) {
  const { locale, t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, posts.length]);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  if (posts.length === 0) return null;

  const title = (post: PostSummary) =>
    locale === "en" && post.titleEn ? post.titleEn : post.title;
  const catName = (category: NonNullable<PostSummary["category"]>) =>
    locale === "en" && category.nameEn ? category.nameEn : category.name;

  return (
    <section className="mb-10 sm:mb-12">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-[15px] sm:text-[17px] font-bold text-text-primary">
          {t("featured")}
        </h2>
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="이전"
            className="p-1.5 rounded-full border border-border-color text-text-tertiary hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="다음"
            className="p-1.5 rounded-full border border-border-color text-text-tertiary hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group snap-start shrink-0 w-[240px] sm:w-[300px] rounded-xl border border-border-color bg-bg-secondary overflow-hidden hover:border-border-light transition-colors"
          >
            <div className="relative w-full" style={{ aspectRatio: "1280 / 720" }}>
              <Image
                src={post.coverImage || "/images/default-thumbnail.png"}
                alt=""
                fill
                sizes="300px"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
            </div>
            <div className="px-4 py-3.5">
              {post.category && (
                <span className="block text-[11px] font-semibold text-accent mb-1">
                  {catName(post.category)}
                </span>
              )}
              <p className="text-[14px] sm:text-[15px] font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                {title(post)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HighlightSections({
  popular,
  guestbook,
}: {
  popular: PopularPost[];
  guestbook: GuestbookPreview[];
}) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;

  if (popular.length === 0 && guestbook.length === 0) return null;

  return (
    <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {popular.length > 0 && (
        <section className="rounded-xl border border-border-color bg-bg-secondary p-5">
          <h2 className="text-[15px] font-bold text-text-primary mb-4">
            {t("popularPosts")}
          </h2>
          <ol className="space-y-3">
            {popular.map((post, index) => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`} className="group flex items-start gap-3">
                  <span className="shrink-0 w-5 text-[15px] font-bold text-accent tabular-nums">
                    {index + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] sm:text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                      {locale === "en" && post.titleEn ? post.titleEn : post.title}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-tertiary">
                      <HiOutlineEye size={12} />
                      {post.views.toLocaleString()}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {guestbook.length > 0 && (
        <section className="rounded-xl border border-border-color bg-bg-secondary p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-text-primary">
              {t("recentGuestbook")}
            </h2>
            <Link
              href="/guestbook"
              className="text-[12px] text-text-tertiary hover:text-accent transition-colors"
            >
              {t("viewAll")}
            </Link>
          </div>
          <ul className="space-y-3">
            {guestbook.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2.5">
                <span className="shrink-0 text-base leading-none mt-0.5">{entry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-text-primary truncate">
                      {entry.nickname}
                    </span>
                    <span className="shrink-0 text-[11px] text-text-tertiary">
                      {format(new Date(entry.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 break-words">
                    {entry.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
