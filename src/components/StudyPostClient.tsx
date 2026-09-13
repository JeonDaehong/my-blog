"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import { HiOutlineArrowLeft, HiOutlineEye } from "react-icons/hi2";
import PostBody from "@/components/PostBody";
import TableOfContents from "@/components/TableOfContents";
import Giscus from "@/components/Giscus";
import type { RenderedMarkdown } from "@/lib/types";

type StudyPost = {
  id: string;
  hasContentEn: boolean;
  slug: string;
  title: string;
  titleEn: string | null;
  coverImage: string | null;
  createdAt: string;
  category: { name: string; nameEn: string | null; slug: string } | null;
};

export default function StudyPostClient({
  post,
  rendered,
}: {
  post: StudyPost;
  rendered: RenderedMarkdown;
}) {
  const { locale, t } = useI18n();
  const pick = (koText: string, en?: string | null) => (locale === "en" && en ? en : koText);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [englishBody, setEnglishBody] = useState<RenderedMarkdown | null>(null);

  useEffect(() => {
    const path = `/study/${post.slug}`;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
    fetch(`/api/views?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((d) => setViewCount(d.total))
      .catch(() => {});
  }, [post.slug]);

  /* 영어 본문은 실제로 전환했을 때만 받아온다. 기본 화면에서는 한국어만 내려간다. */
  useEffect(() => {
    if (locale !== "en" || !post.hasContentEn || englishBody) return;
    let cancelled = false;
    fetch(`/api/posts/${post.id}/content?locale=en`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: RenderedMarkdown | null) => {
        if (!cancelled && data) setEnglishBody(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale, post.id, post.hasContentEn, englishBody]);

  // 아직 못 받았거나 영어 본문이 없으면 한국어를 그대로 보여준다. 목차도 본문을 따라간다.
  const body = locale === "en" && englishBody ? englishBody : rendered;

  return (
    <article>
      <Link
        href="/study"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-8 transition-colors"
      >
        <HiOutlineArrowLeft size={14} /> {t("backToList2")}
      </Link>

      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-text-primary leading-snug">
          {pick(post.title, post.titleEn)}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] sm:text-[13px] text-text-tertiary">
          {post.category && (
            <Link
              href={`/study/category/${post.category.slug}`}
              className="font-medium text-accent hover:underline"
            >
              {pick(post.category.name, post.category.nameEn)}
            </Link>
          )}
          <span>
            {format(
              new Date(post.createdAt),
              locale === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy",
              { locale: locale === "ko" ? ko : enUS }
            )}
          </span>
          {viewCount !== null && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <HiOutlineEye size={14} />
              {viewCount.toLocaleString()}
            </span>
          )}
        </div>
      </header>

      {post.coverImage && (
        <div className="mb-6 sm:mb-8">
          <Image
            src={post.coverImage}
            alt={pick(post.title, post.titleEn)}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg border border-border-color"
          />
        </div>
      )}

      <div className="flex gap-6 lg:gap-10">
        <div className="flex-1 min-w-0 overflow-hidden">
          <PostBody html={body.html} />

          <Giscus />
        </div>
        <TableOfContents toc={body.toc} />
      </div>
    </article>
  );
}
