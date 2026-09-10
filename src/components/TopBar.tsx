"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/components/ThemeProvider";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineGlobeAlt,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiChevronDown,
} from "react-icons/hi2";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

type SearchResult = {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  excerptEn: string | null;
  createdAt: string;
  coverImage: string | null;
  category: { name: string; nameEn: string | null } | null;
};

type NavCategory = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  _count?: { posts: number };
};

/** 검색 결과와 최신 글 목록이 같은 모양을 쓰도록 행 하나를 따로 뺀다. */
function PostRow({
  post,
  title,
  excerpt,
  categoryName,
  highlighted,
  onHover,
  onSelect,
}: {
  post: SearchResult;
  title: string;
  excerpt: string | null;
  categoryName: string | null;
  highlighted?: boolean;
  onHover?: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`w-full text-left flex gap-4 sm:gap-6 px-2 -mx-2 py-5 sm:py-6 rounded-lg transition-colors ${
        highlighted ? "bg-bg-hover" : "hover:bg-bg-hover"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] sm:text-[17px] font-bold text-text-primary leading-snug line-clamp-2">
          {title}
        </p>
        {excerpt && (
          <p className="mt-1.5 text-[13px] sm:text-[14px] text-text-tertiary leading-relaxed line-clamp-2">
            {excerpt}
          </p>
        )}
        <p className="mt-2 flex items-center gap-2 text-[12px] text-text-tertiary">
          {categoryName && (
            <span className="inline-flex items-center gap-1 text-accent">
              <HiOutlineFolder size={11} />
              {categoryName}
            </span>
          )}
          <span>{format(new Date(post.createdAt), "yyyy.MM.dd")}</span>
        </p>
      </div>
      {post.coverImage && (
        <div className="shrink-0 w-[92px] sm:w-[150px]">
          <div
            className="relative w-full rounded-lg overflow-hidden bg-bg-tertiary"
            style={{ aspectRatio: "16 / 9" }}
          >
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="150px"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </button>
  );
}

export default function TopBar({ categories }: { categories: NavCategory[] }) {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "/" 키로 열기, ESC로 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // 카테고리 메뉴: 바깥 클릭으로 닫기
  useEffect(() => {
    if (!catOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!catRef.current?.contains(e.target as Node)) setCatOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [catOpen]);

  // 페이지가 바뀌면 열려 있던 메뉴는 닫는다
  useEffect(() => {
    setCatOpen(false);
  }, [pathname]);

  // 검색창 열릴 때 input 포커스
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  /*
    검색어가 없을 때 보여줄 최신 글. 검색창을 실제로 연 다음에 한 번만 받아와서
    모든 페이지에 이 요청이 얹히지 않게 한다.
  */
  useEffect(() => {
    if (!searchOpen || recent.length > 0) return;
    let cancelled = false;
    fetch("/api/posts?limit=3")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.posts) setRecent(data.posts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [searchOpen, recent.length]);

  // 디바운스 실시간 검색
  const fetchResults = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/posts?q=${encodeURIComponent(q.trim())}&limit=6`
        );
        const data = await res.json();
        setResults(data.posts ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    fetchResults(query);
    setSelectedIndex(-1);
  }, [query, fetchResults]);

  function close() {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      close();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const post = results[selectedIndex];
      if (post) {
        router.push(`/posts/${post.slug}`);
        close();
      }
    }
  }

  function getTitle(post: SearchResult) {
    return locale === "en" && post.titleEn ? post.titleEn : post.title;
  }
  function getExcerpt(post: SearchResult) {
    return locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  }
  function getCatName(cat: SearchResult["category"]) {
    if (!cat) return null;
    return locale === "en" && cat.nameEn ? cat.nameEn : cat.name;
  }

  const showResults = searchOpen && query.trim().length >= 2;
  const hasResults = results.length > 0;

  // "전체 글"은 개별 글에서도 활성으로 둬서 위치 감각을 유지한다.
  const allPostsActive = pathname === "/posts" || pathname.startsWith("/posts/");
  const categoryItems = categories.map((category) => ({
    href: `/category/${category.slug}`,
    label: locale === "en" && category.nameEn ? category.nameEn : category.name,
    count: category._count?.posts,
    active: pathname === `/category/${category.slug}`,
  }));
  const activeCategory = categoryItems.find((item) => item.active);

  const categoryMenu = (
    <div
      className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 w-56 rounded-xl border border-border-color bg-bg-primary shadow-lg overflow-hidden z-30"
    >
      <ul className="py-1.5">
        {categoryItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setCatOpen(false)}
              className={`flex items-center justify-between gap-3 px-4 py-2 text-[14px] transition-colors ${
                item.active
                  ? "text-accent font-semibold bg-accent-muted"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <span className="truncate">{item.label}</span>
              {item.count !== undefined && (
                <span className="shrink-0 text-[12px] text-text-tertiary tabular-nums">
                  {item.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {/* 반투명 + blur이라 본문이 비쳐 보였다. 불투명한 배경으로 고정한다. */}
      <header className="sticky top-0 z-20 border-b border-border-color bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/images/img.jpg"
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 rounded-md object-cover"
              />
              <span className="hidden sm:inline font-semibold text-[15px] text-text-primary tracking-tight">
                Daehong Blog
              </span>
            </Link>

            {/* 카테고리는 목록을 펼쳐 두는 대신 하나의 메뉴로 묶는다 */}
            <nav className="hidden lg:flex items-center gap-7 ml-auto mr-3">
              <Link
                href="/posts"
                className={`text-[15px] whitespace-nowrap transition-colors ${
                  allPostsActive
                    ? "text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t("allPosts")}
              </Link>

              {categoryItems.length > 0 && (
                <div className="relative" ref={catRef}>
                  <button
                    onClick={() => setCatOpen((v) => !v)}
                    aria-expanded={catOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 text-[15px] whitespace-nowrap transition-colors ${
                      activeCategory
                        ? "text-accent font-semibold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {activeCategory ? activeCategory.label : t("categoriesMenu")}
                    <HiChevronDown
                      size={15}
                      className={`transition-transform ${catOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {catOpen && categoryMenu}
                </div>
              )}
            </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/guestbook"
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              pathname === "/guestbook"
                ? "bg-accent-muted text-accent"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            {t("guestbook")}
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            {theme === "dark" ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiOutlineGlobeAlt size={14} />
            {locale === "ko" ? "EN" : "KO"}
          </button>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label={t("search")}
            title={`${t("search")} (/)`}
            className="flex items-center p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiOutlineMagnifyingGlass size={18} />
          </button>
        </div>
          </div>

          {/* 좁은 화면에서도 같은 구성 — 전체 글과 카테고리 메뉴 */}
          <nav className="lg:hidden flex items-center gap-2 pb-2.5">
            <Link
              href="/posts"
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                allPostsActive
                  ? "bg-accent text-white font-medium"
                  : "bg-bg-tertiary text-text-secondary"
              }`}
            >
              {t("allPosts")}
            </Link>

            {categoryItems.length > 0 && (
              <div className="relative" ref={catRef}>
                <button
                  onClick={() => setCatOpen((v) => !v)}
                  aria-expanded={catOpen}
                  className={`flex items-center gap-1 shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                    activeCategory
                      ? "bg-accent text-white font-medium"
                      : "bg-bg-tertiary text-text-secondary"
                  }`}
                >
                  {activeCategory ? activeCategory.label : t("categoriesMenu")}
                  <HiChevronDown
                    size={14}
                    className={`transition-transform ${catOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {catOpen && categoryMenu}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* 전체 화면 검색 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-bg-primary overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 py-5 sm:py-8">
            <div className="relative flex items-center justify-center mb-7 sm:mb-10">
              <Link
                href="/"
                onClick={close}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/images/img.jpg"
                  alt=""
                  width={30}
                  height={30}
                  className="w-[30px] h-[30px] rounded-md object-cover"
                />
                <span className="font-semibold text-[16px] text-text-primary tracking-tight">
                  Daehong Blog
                </span>
              </Link>
              <button
                onClick={close}
                aria-label="닫기"
                className="absolute right-0 p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <HiOutlineXMark size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative">
                <HiOutlineMagnifyingGlass
                  size={20}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    loading ? "text-accent animate-pulse" : "text-text-tertiary"
                  }`}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="제목, 내용으로 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 sm:h-16 pl-12 pr-12 rounded-xl border border-border-color bg-bg-secondary text-text-primary text-[15px] sm:text-[16px] outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:bg-bg-primary"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                    aria-label="지우기"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                )}
              </div>
            </form>

            {!showResults && (
              <div className="mt-7">
                {categoryItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categoryItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="px-3 py-1.5 rounded-full bg-bg-tertiary text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* 아직 아무것도 안 쳤을 때는 최신 글을 보여준다 */}
                {recent.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                      {t("latestPosts")}
                    </p>
                    <ul className="mt-2 border-t border-border-color">
                      {recent.map((post) => (
                        <li key={post.id} className="border-b border-border-color">
                          <PostRow
                            post={post}
                            title={getTitle(post)}
                            excerpt={getExcerpt(post)}
                            categoryName={getCatName(post.category)}
                            onSelect={() => {
                              router.push(`/posts/${post.slug}`);
                              close();
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {showResults && (
              <div className="mt-8">
                {loading && results.length === 0 ? (
                  <p className="py-14 text-center text-text-tertiary text-sm animate-pulse">
                    검색 중...
                  </p>
                ) : hasResults ? (
                  <ul className="border-t border-border-color">
                    {results.map((post, i) => (
                      <li key={post.id} className="border-b border-border-color">
                        <PostRow
                          post={post}
                          highlighted={selectedIndex === i}
                          onHover={() => setSelectedIndex(i)}
                          onSelect={() => {
                            router.push(`/posts/${post.slug}`);
                            close();
                          }}
                          title={getTitle(post)}
                          excerpt={getExcerpt(post)}
                          categoryName={getCatName(post.category)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-14 text-center">
                    <HiOutlineDocumentText
                      size={30}
                      className="mx-auto mb-3 text-text-tertiary opacity-40"
                    />
                    <p className="text-text-secondary text-sm">
                      &lsquo;{query}&rsquo;에 대한 결과가 없습니다
                    </p>
                    <p className="text-text-tertiary text-xs mt-1">
                      다른 검색어를 시도해 보세요
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
