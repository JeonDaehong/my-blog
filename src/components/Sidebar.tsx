"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";

type Category = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  _count?: { posts: number };
};

export default function Sidebar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`block px-3 py-1.5 rounded-md text-[13px] transition-colors ${
        isActive(href)
          ? "bg-accent-muted text-accent font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
      }`}
    >
      {label}
    </Link>
  );

  const getCatName = (cat: Category) =>
    locale === "en" && cat.nameEn ? cat.nameEn : cat.name;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-bg-secondary border border-border-color lg:hidden"
      >
        {open ? (
          <HiOutlineXMark size={18} className="text-text-primary" />
        ) : (
          <HiOutlineBars3 size={18} className="text-text-primary" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-full w-[260px] bg-bg-secondary border-r border-border-color flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border-color">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-[15px] text-text-primary tracking-tight">My Blog</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-color">
              docs
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          <div className="space-y-0.5">
            <p className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              {t("navigation")}
            </p>
            {navLink("/", t("home"))}
            {navLink("/posts", t("allPosts"))}
          </div>

          {categories.length > 0 && (
            <div className="space-y-0.5">
              <p className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                {t("categories")}
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    pathname === `/category/${cat.slug}`
                      ? "bg-accent-muted text-accent font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  <span>{getCatName(cat)}</span>
                  {cat._count && cat._count.posts > 0 && (
                    <span className="text-[11px] text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded">
                      {cat._count.posts}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="space-y-0.5">
            <p className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              {t("settings")}
            </p>
            {navLink("/admin", t("admin"))}
          </div>
        </nav>
      </aside>
    </>
  );
}
