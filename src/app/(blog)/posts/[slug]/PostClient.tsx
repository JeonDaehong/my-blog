"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCalendar, HiOutlineFolder, HiOutlineEye, HiOutlineClock } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import PostBody from "@/components/PostBody";
import TableOfContents from "@/components/TableOfContents";
import Giscus from "@/components/Giscus";
import type { PostDetail, RenderedMarkdown } from "@/lib/types";

type AdjacentPost = { slug: string; title: string } | null;

export default function PostClient({
  post,
  rendered,
  prevPost,
  nextPost,
}: {
  post: PostDetail;
  rendered: RenderedMarkdown;
  prevPost?: AdjacentPost;
  nextPost?: AdjacentPost;
}) {
  const { locale, t } = useI18n();
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [englishBody, setEnglishBody] = useState<RenderedMarkdown | null>(null);

  useEffect(() => {
    const path = `/posts/${post.slug}`;
    fetch("/api/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) }).catch(() => {});
    fetch(`/api/views?path=${encodeURIComponent(path)}`).then(r => r.json()).then(d => setViewCount(d.total)).catch(() => {});
  }, [post.slug]);

  // 영어 본문은 실제로 전환했을 때만 받아온다. 기본 화면에서는 한국어만 내려간다.
  useEffect(() => {
    if (locale !== "en" || !post.hasContentEn || englishBody) return;
    let cancelled = false;
    fetch(`/api/posts/${post.id}/content?locale=en`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RenderedMarkdown | null) => {
        if (!cancelled && data) setEnglishBody(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [locale, post.id, post.hasContentEn, englishBody]);

  const dateLocale = locale === "ko" ? ko : enUS;
  const dateFmt = locale === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy";

  const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
  // 아직 못 받았거나 영어 본문이 없으면 한국어를 그대로 보여준다.
  const body = locale === "en" && englishBody ? englishBody : rendered;
  const catName = post.category
    ? (locale === "en" && post.category.nameEn ? post.category.nameEn : post.category.name)
    : null;

  return (
    <article>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-8 transition-colors">
        <HiOutlineArrowLeft size={14} /> {t("backToList")}
      </Link>

      {post.coverImage && (
        /*
          고정 높이 + object-cover라 커버가 위아래로 잘렸다. 폭만 맞추고 높이는
          이미지 비율대로 두어 전체가 보이게 한다. width/height는 로드 전 자리만
          잡아 주는 값이고, 실제 비율은 로드된 이미지가 결정한다. 세로로 긴
          이미지가 화면을 다 먹지 않도록 max-height만 걸어 둔다.
        */
        <div className="mb-6 sm:mb-8">
          <Image
            src={post.coverImage}
            alt={title}
            width={1600}
            height={900}
            sizes="(max-width: 1024px) 100vw, 720px"
            priority
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg border border-border-color"
          />
        </div>
      )}

      <header className="mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-border-color">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-text-primary leading-snug">
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
            {body.readingTime}{locale === "ko" ? "분 읽기" : " min read"}
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
          <PostBody html={body.html} />

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
        <TableOfContents toc={body.toc} />
      </div>
    </article>
  );
}
