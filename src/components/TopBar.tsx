"use client";

import { useI18n } from "@/lib/i18n";
import { HiOutlineMagnifyingGlass, HiOutlineGlobeAlt } from "react-icons/hi2";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { locale, setLocale, t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 border-b border-border-color bg-bg-primary/80 backdrop-blur-md">
        <div className="flex items-center gap-3 ml-10 lg:ml-0">
          <nav className="hidden sm:flex items-center gap-1 text-[13px] text-text-tertiary">
            <Link href="/" className="hover:text-text-primary transition-colors">
              {t("home")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <HiOutlineGlobeAlt size={14} />
            {locale === "ko" ? "EN" : "KO"}
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-color bg-bg-secondary text-text-tertiary text-[13px] hover:border-border-light hover:text-text-secondary transition-colors"
          >
            <HiOutlineMagnifyingGlass size={14} />
            <span className="hidden sm:inline">{t("search")}</span>
            <kbd className="hidden sm:inline text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-color ml-4">
              /
            </kbd>
          </button>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg mx-4 bg-bg-secondary border border-border-color rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <HiOutlineMagnifyingGlass size={18} className="text-text-tertiary shrink-0" />
              <input
                type="text"
                placeholder={t("search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-tertiary"
              />
              <kbd
                onClick={() => setSearchOpen(false)}
                className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-color text-text-tertiary cursor-pointer hover:bg-bg-hover"
              >
                ESC
              </kbd>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
