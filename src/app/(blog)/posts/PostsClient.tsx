"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineEye } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function PostsClient({ posts }: { posts: any[] }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

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
      <h1 className="text-2xl font-bold tracking-tight mb-1 text-text-primary">
        {t("allPosts")}
      </h1>
      <p className="text-text-tertiary text-sm mb-8">
        {t("totalPosts", { count: posts.length })}
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border-color rounded-lg">
          <p className="text-text-tertiary text-sm">{t("noPosts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {posts.map((post: any) => (
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
                {post.category && (
                  <span className="absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/90 border border-white/10 font-medium">
                    {getCatName(post.category)}
                  </span>
                )}
              </div>

              {/* Content */}
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
                  <span>
                    {format(new Date(post.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
                  </span>
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
      )}
    </div>
  );
}
