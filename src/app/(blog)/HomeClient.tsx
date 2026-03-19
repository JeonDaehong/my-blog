"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineFolder, HiOutlineArrowUpRight } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";

export default function HomeClient({ posts, categories }: { posts: any[]; categories: any[] }) {
  const { locale, t } = useI18n();
  const dateFmt = locale === "ko" ? "M월 d일" : "MMM d";
  const dateLocale = locale === "ko" ? ko : enUS;

  const getTitle = (post: any) => locale === "en" && post.titleEn ? post.titleEn : post.title;
  const getExcerpt = (post: any) => locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  const getCatName = (cat: any) => locale === "en" && cat.nameEn ? cat.nameEn : cat.name;

  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted text-accent text-[12px] font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {t("welcome")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-text-primary">
          {t("blogTitle")}
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mb-8 whitespace-pre-line">
          {t("blogDesc")}
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/posts" className="group flex items-start gap-3 p-4 rounded-lg border border-border-color bg-bg-secondary hover:border-accent/40 hover:bg-bg-tertiary transition-all">
            <div className="w-8 h-8 rounded-md bg-accent-muted flex items-center justify-center shrink-0 mt-0.5">
              <HiOutlineBookOpen size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">{t("viewAllPosts")}</span>
                <HiOutlineArrowUpRight size={12} className="text-text-tertiary group-hover:text-accent transition-colors" />
              </div>
              <p className="text-[12px] text-text-tertiary mt-0.5">{t("viewAllPostsDesc")}</p>
            </div>
          </Link>
          <Link href="/admin" className="group flex items-start gap-3 p-4 rounded-lg border border-border-color bg-bg-secondary hover:border-accent/40 hover:bg-bg-tertiary transition-all">
            <div className="w-8 h-8 rounded-md bg-accent-muted flex items-center justify-center shrink-0 mt-0.5">
              <HiOutlineFolder size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">{t("admin")}</span>
                <HiOutlineArrowUpRight size={12} className="text-text-tertiary group-hover:text-accent transition-colors" />
              </div>
              <p className="text-[12px] text-text-tertiary mt-0.5">{t("adminDesc")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <HiOutlineFolder size={16} className="text-text-tertiary" />
            {t("categories")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-color bg-bg-secondary text-[13px] text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all">
                {getCatName(cat)}
                <span className="text-[11px] text-text-tertiary">{cat._count.posts}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent posts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <HiOutlineBookOpen size={16} className="text-text-tertiary" />
            {t("latestPosts")}
          </h2>
          {posts.length > 0 && (
            <Link href="/posts" className="text-[12px] text-accent hover:text-accent-hover flex items-center gap-1 transition-colors">
              {t("viewAll")} <HiOutlineArrowRight size={12} />
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-color rounded-lg">
            <p className="text-text-tertiary text-sm mb-1">{t("noPosts")}</p>
            <p className="text-text-tertiary text-[12px]">
              <Link href="/admin" className="text-accent hover:underline">{t("admin")}</Link> - {t("noPostsDesc")}
            </p>
          </div>
        ) : (
          <div className="border border-border-color rounded-lg divide-y divide-border-color overflow-hidden">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="group flex items-center gap-4 px-4 py-3 hover:bg-bg-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                    {getTitle(post)}
                  </h3>
                  {getExcerpt(post) && (
                    <p className="text-[12px] text-text-tertiary mt-0.5 truncate">{getExcerpt(post)}</p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  {post.category && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-color">
                      {getCatName(post.category)}
                    </span>
                  )}
                  <span className="text-[12px] text-text-tertiary whitespace-nowrap">
                    {format(new Date(post.createdAt), dateFmt, { locale: dateLocale })}
                  </span>
                </div>
                <HiOutlineArrowRight size={14} className="text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
