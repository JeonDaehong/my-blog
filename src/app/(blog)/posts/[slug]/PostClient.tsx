"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineFolder, HiOutlineEye } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import Giscus from "@/components/Giscus";

export default function PostClient({ post }: { post: any }) {
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

  return (
    <article className="overflow-x-hidden">
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
          {catName && (
            <Link href={`/category/${post.category.slug}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <HiOutlineFolder size={14} />
              {catName}
            </Link>
          )}
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
          <Giscus />
        </div>
        <TableOfContents content={content} />
      </div>
    </article>
  );
}
