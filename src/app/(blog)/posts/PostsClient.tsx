"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";

export default function PostsClient({ posts }: { posts: any[] }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;

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
        <div className="border border-border-color rounded-lg divide-y divide-border-color overflow-hidden">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group flex items-center gap-4 px-4 py-3.5 hover:bg-bg-hover transition-colors"
            >
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
