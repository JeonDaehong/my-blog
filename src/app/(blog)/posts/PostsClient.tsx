"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineEye, HiOutlineArrowRight } from "react-icons/hi2";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

type ViewMode = "card" | "list";

export default function PostsClient({ posts }: { posts: any[] }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("postViewMode") as ViewMode) || "card";
    }
    return "card";
  });

  useEffect(() => {
    localStorage.setItem("postViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    posts.forEach((post) => {
      const path = `/posts/${post.slug}`;
      fetch(`/api/views?path=${encodeURIComponent(path)}`)
        .then((r) => r.json())
        .then((d) => {
          setViewCounts((prev) => ({ ...prev, [post.slug]: d.total }));
        })
        .catch(() => {});
    });
  }, [posts]);

  const getTitle = (post: any) => locale === "en" && post.titleEn ? post.titleEn : post.title;
  const getExcerpt = (post: any) => locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  const getCatName = (cat: any) => locale === "en" && cat.nameEn ? cat.nameEn : cat.name;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-text-primary">
            {t("allPosts")}
          </h1>
          <p className="text-text-tertiary text-sm">
            {t("totalPosts", { count: posts.length })}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1 border border-border-color">
          <button
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "card"
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
            title="Card view"
          >
            <HiOutlineViewGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-accent text-white"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
            title="List view"
          >
            <HiOutlineViewList size={16} />
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border-color rounded-lg">
          <p className="text-text-tertiary text-sm">{t("noPosts")}</p>
        </div>
      ) : viewMode === "card" ? (
        /* ── Card View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group rounded-xl border border-border-color overflow-hidden hover:border-border-light hover:shadow-lg hover:shadow-black/20 transition-all duration-200 bg-bg-secondary"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1280 / 720" }}>
                <img
                  src={post.coverImage || "/images/default-thumbnail.png"}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                {post.category && (
                  <span className="absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/90 border border-white/10 font-medium">
                    {getCatName(post.category)}
                  </span>
                )}
              </div>
              <div className="px-4 py-4">
                <h2 className="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-2">
                  {getTitle(post)}
                </h2>
                {getExcerpt(post) && (
                  <p className="text-[13px] text-text-tertiary line-clamp-2 leading-relaxed mb-3">
                    {getExcerpt(post)}
                  </p>
                )}
                <div className="flex items-center justify-between text-[12px] text-text-tertiary">
                  <span>{format(new Date(post.createdAt), "yyyy.MM.dd", { locale: dateLocale })}</span>
                  {viewCounts[post.slug] !== undefined && (
                    <span className="inline-flex items-center gap-1 text-accent/80">
                      <HiOutlineEye size={13} />
                      {viewCounts[post.slug].toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="border border-border-color rounded-lg divide-y divide-border-color overflow-hidden">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex items-center gap-4 px-4 py-3.5 hover:bg-bg-hover transition-colors"
            >
              <img
                src={post.coverImage || "/images/default-thumbnail.png"}
                alt=""
                className="w-16 h-10 sm:w-20 sm:h-12 rounded object-cover border border-border-color shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                  {getTitle(post)}
                </h2>
                {getExcerpt(post) && (
                  <p className="text-[12px] text-text-tertiary mt-0.5 truncate">
                    {getExcerpt(post)}
                  </p>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {post.category && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-color">
                    {getCatName(post.category)}
                  </span>
                )}
                {viewCounts[post.slug] !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-accent/80">
                    <HiOutlineEye size={12} />
                    {viewCounts[post.slug].toLocaleString()}
                  </span>
                )}
                <span className="text-[12px] text-text-tertiary whitespace-nowrap">
                  {format(new Date(post.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
                </span>
              </div>
              <HiOutlineArrowRight size={14} className="text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
