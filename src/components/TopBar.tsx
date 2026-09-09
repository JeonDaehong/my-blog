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
  category: { name: string; nameEn: string | null } | null;
};

type NavCategory = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
};

export default function TopBar({ categories }: { categories: NavCategory[] }) {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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

  // 검색창 열릴 때 input 포커스
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

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
      router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
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

  // "전체"는 글 목록과 개별 글 모두에서 활성으로 둬서 위치 감각을 유지한다.
  const navTabs = [
    {
      href: "/posts",
      label: t("allPosts"),
      active: pathname === "/posts" || pathname.startsWith("/posts/"),
    },
    ...categories.map((category) => ({
      href: `/category/${category.slug}`,
      label: locale === "en" && category.nameEn ? category.nameEn : category.name,
      active: pathname === `/category/${category.slug}`,
    })),
  ];

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border-color bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-3">
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

        <div className="flex items-center gap-1">
          <Link
            href="/guestbook"
            className={`px-2 sm:px-2.5 py-1.5 rounded-md text-[13px] whitespace-nowrap transition-colors ${
              pathname === "/guestbook"
                ? "text-accent font-medium"
                : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover"
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-color bg-bg-secondary text-text-tertiary text-[13px] hover:border-border-light hover:text-text-secondary transition-colors"
          >
            <HiOutlineMagnifyingGlass size={14} />
            <span className="hidden sm:inline">{t("search")}</span>
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-color ml-1 font-mono opacity-60">
              /
            </kbd>
          </button>
        </div>
          </div>

          {/* 카테고리 탭 — 사이드바를 대신하는 주 내비게이션 */}
          <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {navTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-2.5 pt-0.5 text-[14px] transition-colors ${
                  tab.active
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent text-text-tertiary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 bg-black/50 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-xl bg-bg-secondary border border-border-color rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input row */}
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-color">
                <HiOutlineMagnifyingGlass
                  size={18}
                  className={`shrink-0 transition-colors ${loading ? "text-accent animate-pulse" : "text-text-tertiary"}`}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-tertiary"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                    className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <HiOutlineXMark size={16} />
                  </button>
                ) : (
                  <kbd
                    onClick={close}
                    className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-color text-text-tertiary cursor-pointer hover:bg-bg-hover font-mono"
                  >
                    ESC
                  </kbd>
                )}
              </div>
            </form>

            {/* Results */}
            {showResults && (
              <div className="max-h-[360px] overflow-y-auto">
                {loading && results.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-text-tertiary text-sm">
                    <span className="animate-pulse">검색 중...</span>
                  </div>
                ) : hasResults ? (
                  <>
                    <ul className="py-1">
                      {results.map((post, i) => (
                        <li key={post.id}>
                          <button
                            type="button"
                            onClick={() => { router.push(`/posts/${post.slug}`); close(); }}
                            onMouseEnter={() => setSelectedIndex(i)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                              selectedIndex === i ? "bg-bg-hover" : "hover:bg-bg-hover"
                            }`}
                          >
                            <HiOutlineDocumentText
                              size={16}
                              className="shrink-0 mt-0.5 text-text-tertiary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-text-primary truncate">
                                {getTitle(post)}
                              </p>
                              {getExcerpt(post) && (
                                <p className="text-[11px] text-text-tertiary truncate mt-0.5">
                                  {getExcerpt(post)}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {getCatName(post.category) && (
                                <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                                  <HiOutlineFolder size={10} />
                                  {getCatName(post.category)}
                                </span>
                              )}
                              <span className="text-[10px] text-text-tertiary opacity-60">
                                {format(new Date(post.createdAt), "yyyy.MM.dd")}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* 전체 검색 결과 보기 */}
                    <div className="border-t border-border-color">
                      <button
                        type="button"
                        onClick={() => { router.push(`/posts?q=${encodeURIComponent(query.trim())}`); close(); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-[12px] text-text-tertiary hover:text-accent hover:bg-bg-hover transition-colors"
                      >
                        <span>
                          &lsquo;{query}&rsquo; 전체 검색 결과 보기
                        </span>
                        <span className="text-[11px] opacity-60">↵</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <HiOutlineMagnifyingGlass size={28} className="text-text-tertiary opacity-30 mb-2" />
                    <p className="text-text-secondary text-sm">
                      &lsquo;{query}&rsquo;에 대한 결과가 없습니다
                    </p>
                    <p className="text-text-tertiary text-xs mt-1">다른 검색어를 시도해 보세요</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border-color bg-bg-tertiary/50">
              <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <kbd className="px-1 py-0.5 rounded border border-border-color bg-bg-secondary text-[10px] font-mono">↵</kbd>
                전체 검색
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <kbd className="px-1 py-0.5 rounded border border-border-color bg-bg-secondary text-[10px] font-mono">↑↓</kbd>
                이동
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <kbd className="px-1 py-0.5 rounded border border-border-color bg-bg-secondary text-[10px] font-mono">ESC</kbd>
                닫기
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
