"use client";

import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineFolder } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";

export default function PostClient({ post }: { post: any }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;
  const dateFmt = locale === "ko" ? "yyyy년 M월 d일" : "MMMM d, yyyy";

  const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
  const content = locale === "en" && post.contentEn ? post.contentEn : post.content;
  const catName = post.category
    ? (locale === "en" && post.category.nameEn ? post.category.nameEn : post.category.name)
    : null;

  return (
    <article>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-8 transition-colors">
        <HiOutlineArrowLeft size={14} /> {t("backToList")}
      </Link>

      {post.coverImage && (
        <img src={post.coverImage} alt={title} className="w-full h-56 lg:h-72 object-cover rounded-lg mb-8 border border-border-color" />
      )}

      <header className="mb-10 pb-6 border-b border-border-color">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-text-primary">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-[13px] text-text-tertiary">
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
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0">
          <MarkdownRenderer content={content} />
        </div>
        <TableOfContents content={content} />
      </div>
    </article>
  );
}
