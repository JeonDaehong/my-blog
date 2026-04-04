"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCalendar, HiOutlineFolder, HiOutlineEye, HiOutlineClock } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import Giscus from "@/components/Giscus";
import type { PostWithCategory } from "@/lib/types";

type AdjacentPost = { slug: string; title: string } | null;

function getReadingTime(content: string): number {
  const words = content.replace(/[#*`~\[\]()!>|-]/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function PostClient({
  post,
  prevPost,
  nextPost,
}: {
  post: PostWithCategory;
  prevPost?: AdjacentPost;
  nextPost?: AdjacentPost;
}) {
  const { locale, t } = useI18n();
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    const path = `/posts/${post.slug}`;
    fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) }).catch(() => {});
    fetch(`/api/views?path=${encodeURIComponent(path)}`).then(r => r.json()).then(d => setViewCount(d.total)).catch(() => {});
  }, [post.slug]);
  const dateLocale = locale === "ko" ? ko : enUS;
  const dateFmt = locale === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy";

  const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
  const content = locale === "en" && post.contentEn ? post.contentEn : post.content;
  const catName = post.category
    ? (locale === "en" && post.category.nameEn ? post.category.nameEn : post.category.name)
    : null;
  const readingTime = getReadingTime(content);

  return (
    <article>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-8 transition-colors">
        <HiOutlineArrowLeft size={14} /> {t("backToList")}
      </Link>

      {post.coverImage && (
        <div className="relative w-full h-40 sm:h-56 lg:h-72 mb-6 sm:mb-8">
          <Image
            src={post.coverImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 720px"
            priority
            className="object-cover rounded-lg border border-border-color"
          />
        </div>
      )}

      <header className="mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-border-color">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-3 sm:mb-4 text-text-primary leading-snug">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[12px] sm:text-[13px] text-text-tertiary">
          <span className="flex items-center gap-1.5">
            <HiOutlineCalendar size={14} />
            {format(new Date(post.createdAt), dateFmt, { locale: dateLocale })}
          </span>
          {catName && post.category && (
            <Link href={`/category/${post.category.slug}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <HiOutlineFolder size={14} />
              {catName}
            </Link>
          )}
          <span className="flex items-center gap-1.5">
            <HiOutlineClock size={14} />
            {readingTime}{locale === "ko" ? "분 읽기" : " min read"}
          </span>
          {viewCount !== null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-muted text-accent text-[12px] font-medium">
              <HiOutlineEye size={14} />
              {viewCount.toLocaleString()} views
            </span>
          )}
        </div>
      </header>

      <div className="flex gap-6 lg:gap-10">
        <div className="flex-1 min-w-0 overflow-hidden">
          <MarkdownRenderer content={content} />

          {/* 이전/다음 글 네비게이션 */}
          {(prevPost || nextPost) && (
            <nav className="mt-12 pt-8 border-t border-border-color grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="group flex flex-col gap-1 p-4 rounded-xl border border-border-color hover:border-accent/50 hover:bg-bg-hover transition-all"
                >
                  <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <HiOutlineArrowLeft size={12} />
                    {locale === "ko" ? "이전 글" : "Previous"}
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="group flex flex-col gap-1 p-4 rounded-xl border border-border-color hover:border-accent/50 hover:bg-bg-hover transition-all text-right"
                >
                  <span className="text-[11px] text-text-tertiary flex items-center gap-1 justify-end">
                    {locale === "ko" ? "다음 글" : "Next"}
                    <HiOutlineArrowRight size={12} />
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <Giscus />
        </div>
        <TableOfContents content={content} />
      </div>
    </article>
  );
}
