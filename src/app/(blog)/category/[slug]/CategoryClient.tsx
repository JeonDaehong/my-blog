"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi2";
import { useI18n } from "@/lib/i18n";

export default function CategoryClient({ category }: { category: any }) {
  const { locale, t } = useI18n();
  const dateLocale = locale === "ko" ? ko : enUS;

  const catName = locale === "en" && category.nameEn ? category.nameEn : category.name;
  const getTitle = (post: any) => locale === "en" && post.titleEn ? post.titleEn : post.title;
  const getExcerpt = (post: any) => locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-accent mb-6 transition-colors">
        <HiOutlineArrowLeft size={14} /> {t("backToHome")}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1 text-text-primary">{catName}</h1>
      {category.description && (
        <p className="text-text-tertiary text-sm mb-2">
          {locale === "en" && category.descriptionEn ? category.descriptionEn : category.description}
        </p>
      )}
      <p className="text-text-tertiary text-[12px] mb-8">
        {t("postsInCategory", { count: category.posts.length })}
      </p>

      {category.posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border-color rounded-lg">
          <p className="text-text-tertiary text-sm">{t("noCategoryPosts")}</p>
        </div>
      ) : (
        <div className="border border-border-color rounded-lg divide-y divide-border-color overflow-hidden">
          {category.posts.map((post: any) => (
            <Link key={post.id} href={`/posts/${post.slug}`}
              className="group flex items-center gap-4 px-4 py-3.5 hover:bg-bg-hover transition-colors">
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                  {getTitle(post)}
                </h2>
                {getExcerpt(post) && (
                  <p className="text-[12px] text-text-tertiary mt-0.5 truncate">{getExcerpt(post)}</p>
                )}
              </div>
              <span className="text-[12px] text-text-tertiary whitespace-nowrap hidden sm:block">
                {format(new Date(post.createdAt), "yyyy.MM.dd", { locale: dateLocale })}
              </span>
              <HiOutlineArrowRight size={14} className="text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
