"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import type { PostSummary, PopularPost, GuestbookPreview } from "@/lib/types";

const AUTO_ADVANCE_MS = 5000;

/**
 * 상단 추천 영역. 슬라이드 트랙을 통째로 밀어서 넘기고, 5초마다 자동으로
 * 다음 글로 넘어간다. 마우스를 올리거나 포커스가 들어오면 멈추고,
 * 화살표를 누르면 타이머를 다시 센다.
 */
export function FeaturedHero({ posts }: { posts: PostSummary[] }) {
  const { locale } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = posts.length;
  const hasMultiple = total > 1;

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total]
  );

  useEffect(() => {
    if (!hasMultiple || paused) return;
    // 모션을 줄이도록 설정한 사용자에게는 자동 전환을 걸지 않는다.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    timerRef.current = setInterval(
      () => setIndex((i) => (i + 1) % total),
      AUTO_ADVANCE_MS
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasMultiple, paused, total, index]);

  if (total === 0) return null;

  const title = (post: PostSummary) =>
    locale === "en" && post.titleEn ? post.titleEn : post.title;
  const excerpt = (post: PostSummary) =>
    locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;

  return (
    <section
      className="py-8 sm:py-14 lg:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="w-full shrink-0"
              aria-hidden={i !== index}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-14 items-center">
                <div className="order-2 lg:order-1">
                  <Link href={`/posts/${post.slug}`} className="group block">
                    <h2 className="text-[26px] sm:text-[36px] lg:text-[40px] font-bold text-text-primary leading-[1.25] tracking-tight group-hover:text-accent transition-colors">
                      {title(post)}
                    </h2>
                    {excerpt(post) && (
                      <p className="mt-3 sm:mt-4 text-[15px] sm:text-[17px] text-text-tertiary leading-relaxed line-clamp-2">
                        {excerpt(post)}
                      </p>
                    )}
                  </Link>
                </div>

                <Link
                  href={`/posts/${post.slug}`}
                  className="group order-1 lg:order-2 block rounded-2xl overflow-hidden bg-bg-tertiary"
                >
                  <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
                    <Image
                      src={post.coverImage || "/images/default-thumbnail.png"}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      priority={i === 0}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <div className="lg:w-1/2 lg:pr-7 mt-6 sm:mt-8 flex items-center gap-2.5">
          <button
            onClick={() => go(index - 1)}
            aria-label="이전 추천 글"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border-color flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="다음 추천 글"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border-color flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

function SidebarCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-bg-secondary border border-border-color p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-text-secondary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PopularCard({ posts }: { posts: PopularPost[] }) {
  const { locale, t } = useI18n();
  if (posts.length === 0) return null;

  return (
    <SidebarCard title={t("popularPosts")}>
      <ol className="space-y-4">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="group flex gap-3">
              <span className="shrink-0 w-4 text-[14px] font-bold text-accent tabular-nums leading-snug">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                  {locale === "en" && post.titleEn ? post.titleEn : post.title}
                </span>
                <span className="mt-1 block text-[12px] text-text-tertiary">
                  {post.views.toLocaleString()} views
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </SidebarCard>
  );
}

export function GuestbookCard({ entries }: { entries: GuestbookPreview[] }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;
  if (entries.length === 0) return null;

  return (
    <SidebarCard
      title={t("recentGuestbook")}
      action={
        <Link
          href="/guestbook"
          className="text-[12px] text-text-tertiary hover:text-accent transition-colors"
        >
          {t("viewAll")}
        </Link>
      }
    >
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-2.5">
            <span className="shrink-0 text-base leading-none mt-0.5">{entry.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 break-words">
                {entry.message}
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary truncate">
                {entry.nickname} · {format(new Date(entry.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SidebarCard>
  );
}
