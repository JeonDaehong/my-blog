"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineArrowLeft, HiOutlineChatBubbleOvalLeft, HiOutlineEye } from "react-icons/hi2";
import { useCommentCounts } from "@/lib/use-comment-counts";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import { categoryPageHref } from "@/lib/posts-nav";
import type { PaginationMeta } from "@/lib/types";

export default function CategoryClient({
  category,
  pagination,
}: {
  category: any;
  pagination: PaginationMeta;
}) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const commentCounts = useCommentCounts(category.posts.map((post: any) => post.slug), "/posts");

  const catName = locale === "en" && category.nameEn ? category.nameEn : category.name;
  const getTitle = (post: any) => locale === "en" && post.titleEn ? post.titleEn : post.title;
  const getExcerpt = (post: any) => locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;

  // 글마다 따로 묻지 않고 목록 전체를 한 번에 묻는다 (엣지 캐시도 이 묶음 조회에만 걸린다).
  useEffect(() => {
    if (category.posts.length === 0) return;
    const paths = category.posts.map((post: any) => `/posts/${post.slug}`).join(",");
    fetch(`/api/views?paths=${encodeURIComponent(paths)}`)
      .then((r) => r.json())
      .then((countMap: Record<string, number>) => {
        const result: Record<string, number> = {};
        for (const post of category.posts as any[]) {
          const count = countMap[`/posts/${post.slug}`];
          result[post.slug] = count ?? 0;
        }
        setViewCounts(result);
      })
      .catch(() => {});
  }, [category.posts]);

  return (
    <div>
      <Link href="/posts" className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-6 transition-colors">
        <HiOutlineArrowLeft size={14} /> {t("backToAllPosts")}
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-text-primary">{catName}</h1>
      {category.description && (
        <p className="text-text-tertiary text-sm mb-2">
          {locale === "en" && category.descriptionEn ? category.descriptionEn : category.description}
        </p>
      )}
      <p className="text-text-tertiary text-[12px] mb-8">
        {t("postsInCategory", { count: pagination.total })}
      </p>

      {category.posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-tertiary text-sm">{t("noCategoryPosts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {category.posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group rounded-xl border border-border-color overflow-hidden hover:border-border-light hover:shadow-lg hover:shadow-black/20 transition-all duration-200 bg-bg-secondary"
            >
              {/* Thumbnail */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1280 / 720" }}>
                <img
                  src={post.coverImage || "/images/default-thumbnail.png"}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="px-4 sm:px-5 py-4 sm:py-5">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1.5 sm:mb-2">
                  {getTitle(post)}
                </h2>
                {getExcerpt(post) && (
                  <p className="text-[12px] sm:text-[13px] text-text-tertiary line-clamp-2 leading-relaxed mb-2.5 sm:mb-3">
                    {getExcerpt(post)}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-text-tertiary">
                  <span>
                    {format(new Date(post.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
                  </span>
                  <span className="inline-flex items-center gap-3 tabular-nums">
                    {viewCounts[post.slug] !== undefined && (
                      <span className="inline-flex items-center gap-1 text-accent/80">
                        <HiOutlineEye size={13} />
                        {viewCounts[post.slug].toLocaleString()}
                      </span>
                    )}
                    {commentCounts[post.slug] !== undefined && (
                      <span className="inline-flex items-center gap-1 text-accent/80" title="댓글">
                        <HiOutlineChatBubbleOvalLeft size={13} />
                        {commentCounts[post.slug].toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        pagination={pagination}
        hrefFor={(p) => categoryPageHref(category.slug, p)}
      />
    </div>
  );
}
