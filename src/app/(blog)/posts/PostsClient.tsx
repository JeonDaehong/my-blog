"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import {
  HiOutlineEye,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import type { PostSummary, PaginationMeta, PostsExtras } from "@/lib/types";
import { postsPageHref } from "@/lib/posts-nav";
import {
  FeaturedHero,
  PopularCard,
  CommentsCard,
} from "@/components/PostsHighlights";

type ViewMode = "card" | "list";

type Props = {
  posts: PostSummary[];
  pagination: PaginationMeta;
  query?: string | null;
  extras: PostsExtras;
};

export default function PostsClient({ posts, pagination, query, extras }: Props) {
  const router = useRouter();
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
    if (posts.length === 0) return;
    const paths = posts.map((post) => `/posts/${post.slug}`).join(",");
    fetch(`/api/views?paths=${encodeURIComponent(paths)}`)
      .then((r) => r.json())
      .then((countMap: Record<string, number>) => {
        const result: Record<string, number> = {};
        for (const post of posts) {
          const path = `/posts/${post.slug}`;
          if (countMap[path] !== undefined) result[post.slug] = countMap[path];
        }
        setViewCounts(result);
      })
      .catch(() => {});
  }, [posts]);

  const getTitle = (post: PostSummary) =>
    locale === "en" && post.titleEn ? post.titleEn : post.title;
  const getExcerpt = (post: PostSummary) =>
    locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  const getCatName = (cat: NonNullable<PostSummary["category"]>) =>
    locale === "en" && cat.nameEn ? cat.nameEn : cat.name;

  function goToPage(p: number) {
    router.push(postsPageHref(p, query));
  }

  function clearSearch() {
    router.push("/posts");
  }

  const isSearching = !!query;
  const hasAside =
    extras.popular.length > 0 ||
    extras.comments.length > 0;

  return (
    <div>
      {!isSearching && <FeaturedHero posts={extras.featured} />}

      <div
        className={
          hasAside
            ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14"
            : ""
        }
      >
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 mb-5 sm:mb-7">
            <div className="min-w-0">
              {isSearching ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineMagnifyingGlass size={18} className="text-accent shrink-0" />
                    <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary truncate">
                      &lsquo;{query}&rsquo;
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-text-tertiary text-xs sm:text-sm">
                      {pagination.total === 0
                        ? "검색 결과가 없습니다"
                        : `검색 결과 ${pagination.total}개`}
                    </p>
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-border-color text-text-tertiary hover:text-accent hover:border-accent transition-colors"
                    >
                      <HiOutlineXMark size={11} />
                      검색 지우기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-text-primary">
                    {t("allPosts")}
                  </h1>
                  <p className="mt-1 text-text-tertiary text-xs sm:text-sm">
                    {t("totalPosts", { count: pagination.total })}
                  </p>
                </>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-1 bg-bg-tertiary rounded-lg p-1 border border-border-color">
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "card"
                    ? "bg-accent text-white"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
                title="Article view"
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
                title="Compact view"
              >
                <HiOutlineViewList size={16} />
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              {isSearching ? (
                <>
                  <HiOutlineMagnifyingGlass
                    size={32}
                    className="mx-auto mb-3 text-text-tertiary opacity-40"
                  />
                  <p className="text-text-secondary text-sm font-medium mb-1">
                    &lsquo;{query}&rsquo;에 대한 결과가 없습니다
                  </p>
                  <p className="text-text-tertiary text-xs mb-4">
                    다른 검색어를 시도해 보세요
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-xs text-accent hover:underline"
                  >
                    전체 글 보기
                  </button>
                </>
              ) : (
                <p className="text-text-tertiary text-sm">{t("noPosts")}</p>
              )}
            </div>
          ) : viewMode === "card" ? (
            /* ── 토스식 아티클 행: 왼쪽 텍스트, 오른쪽 썸네일 ── */
            <div className="border-t border-border-color">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group flex items-center gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border-color"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:mb-3">
                      {post.category && (
                        <span className="text-[12px] sm:text-[13px] font-medium px-2.5 py-1 rounded-md bg-accent-muted text-accent">
                          {getCatName(post.category)}
                        </span>
                      )}
                      <span className="text-[12px] sm:text-[13px] px-2.5 py-1 rounded-md bg-bg-tertiary text-text-tertiary">
                        {format(new Date(post.createdAt), "yyyy.MM.dd", {
                          locale: dateLocale,
                        })}
                      </span>
                    </div>

                    <h2 className="text-[17px] sm:text-[20px] font-bold text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2">
                      {getTitle(post)}
                    </h2>

                    {getExcerpt(post) && (
                      <p className="mt-2 text-[14px] sm:text-[15px] text-text-tertiary leading-relaxed line-clamp-2">
                        {getExcerpt(post)}
                      </p>
                    )}

                    {viewCounts[post.slug] !== undefined && (
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] text-text-tertiary">
                        <HiOutlineEye size={13} />
                        {viewCounts[post.slug].toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/*
                    좁은 화면에서는 고정 폭이 너무 작아 보여서 화면 비율로 잡는다.
                    예전에는 self-stretch로 행 높이를 채웠는데, 그러면 썸네일 비율이
                    글 제목·요약 길이에 따라 달라져서 같은 글도 한국어와 영어에서
                    잘리는 정도가 달랐다. 커버 이미지 비율(1.91:1)로 고정해 언어와
                    무관하게 같은 그림이 나오게 한다.

                    대신 글 칸 높이는 제목 줄 수에 따라 변한다. 영어 제목은 두 줄이
                    되는 일이 많아 위쪽만 맞추면 아래 여백만 커져 보이므로, 행을
                    가운데 정렬(items-center)해 남는 높이를 위아래로 나눈다.
                  */}
                  <div className="shrink-0 w-[38%] max-w-[150px] sm:w-[220px] sm:max-w-none">
                    <div
                      className="relative w-full aspect-[1.91] rounded-xl overflow-hidden bg-bg-tertiary"
                    >
                      <Image
                        src={post.coverImage || "/images/default-thumbnail.png"}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 40vw, 220px"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ── 압축 목록 ── */
            <div className="border border-border-color rounded-lg divide-y divide-border-color overflow-hidden">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group flex items-center gap-2.5 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 hover:bg-bg-hover transition-colors overflow-hidden"
                >
                  <div className="relative w-12 h-8 sm:w-20 sm:h-12 shrink-0">
                    <Image
                      src={post.coverImage || "/images/default-thumbnail.png"}
                      alt=""
                      fill
                      sizes="80px"
                      className="rounded object-cover border border-border-color"
                    />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h2 className="text-[13px] sm:text-[14px] font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                      {getTitle(post)}
                    </h2>
                    <p className="text-[11px] sm:text-[12px] text-text-tertiary mt-0.5 truncate">
                      {getExcerpt(post) ||
                        format(new Date(post.createdAt), "yyyy.MM.dd", {
                          locale: dateLocale,
                        })}
                    </p>
                  </div>
                  {/*
                    행마다 카테고리 이름 길이와 조회수 유무가 달라 flex로 두면
                    줄이 어긋난다. 고정 폭 그리드로 열을 맞춘다.
                  */}
                  <div className="hidden sm:grid grid-cols-[120px_64px_80px] items-center gap-3 shrink-0">
                    <span className="min-w-0">
                      {post.category && (
                        <span className="block truncate text-center text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-color">
                          {getCatName(post.category)}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center justify-end gap-1 text-[11px] text-text-tertiary tabular-nums">
                      {viewCounts[post.slug] !== undefined && (
                        <>
                          <HiOutlineEye size={12} className="shrink-0" />
                          {viewCounts[post.slug].toLocaleString()}
                        </>
                      )}
                    </span>
                    <span className="text-[12px] text-right text-text-tertiary tabular-nums whitespace-nowrap">
                      {format(new Date(post.createdAt), "yyyy.MM.dd", {
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-md border border-border-color text-text-tertiary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <HiChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
                    p === pagination.page
                      ? "bg-accent text-white"
                      : "border border-border-color text-text-tertiary hover:bg-bg-hover"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-md border border-border-color text-text-tertiary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <HiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {hasAside && (
          <aside className="space-y-5 lg:sticky lg:top-28 self-start">
            <PopularCard posts={extras.popular} />
            <CommentsCard comments={extras.comments} />
          </aside>
        )}
      </div>
    </div>
  );
}
