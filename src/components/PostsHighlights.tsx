"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import type { PostSummary, PopularPost, GuestbookPreview } from "@/lib/types";

/**
 * 토스 테크 상단의 큰 히어로. 좌측에 제목과 요약, 우측에 큰 이미지를 두고
 * 화살표로 추천 글 사이를 넘긴다. 좁은 화면에서는 이미지가 위로 올라간다.
 */
export function FeaturedHero({ posts }: { posts: PostSummary[] }) {
  const { locale } = useI18n();
  const [index, setIndex] = useState(0);

  if (posts.length === 0) return null;

  const post = posts[Math.min(index, posts.length - 1)];
  const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
  const excerpt = locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  const hasMultiple = posts.length > 1;

  return (
    <section className="py-8 sm:py-14 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-14 items-center">
        <div className="order-2 lg:order-1">
          <Link href={`/posts/${post.slug}`} className="group block">
            <h2 className="text-[26px] sm:text-[36px] lg:text-[40px] font-bold text-text-primary leading-[1.25] tracking-tight group-hover:text-accent transition-colors">
              {title}
            </h2>
            {excerpt && (
              <p className="mt-3 sm:mt-4 text-[15px] sm:text-[17px] text-text-tertiary leading-relaxed line-clamp-2">
                {excerpt}
              </p>
            )}
          </Link>

          {hasMultiple && (
            <div className="flex items-center gap-2.5 mt-6 sm:mt-10">
              <button
                onClick={() => setIndex((i) => (i - 1 + posts.length) % posts.length)}
                aria-label="이전 추천 글"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border-color flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <HiChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % posts.length)}
                aria-label="다음 추천 글"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-border-color flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <HiChevronRight size={18} />
              </button>
              <span className="ml-1 text-[12px] tabular-nums text-text-tertiary">
                {(index % posts.length) + 1} / {posts.length}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/posts/${post.slug}`}
          className="order-1 lg:order-2 block rounded-2xl overflow-hidden bg-bg-tertiary"
        >
          <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
            <Image
              src={post.coverImage || "/images/default-thumbnail.png"}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              priority
              className="object-cover"
            />
          </div>
        </Link>
      </div>
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
