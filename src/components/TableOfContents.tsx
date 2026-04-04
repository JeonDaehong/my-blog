"use client";

import { useEffect, useState, useMemo } from "react";
import { HiOutlineListBullet, HiOutlineXMark } from "react-icons/hi2";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];

  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~\[\]]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
        .replace(/\s+/g, "-");
      toc.push({ id, text, level });
    }
  }
  return toc;
}

function TocList({
  toc,
  activeId,
  onItemClick,
}: {
  toc: TocItem[];
  activeId: string;
  onItemClick?: (id: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {toc.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  onItemClick?.(item.id);
                }
              }}
              className={`
                group flex items-center gap-2 py-1 pr-2 rounded-md text-[12px] leading-snug transition-all duration-150
                ${item.level === 1 ? "pl-2" : item.level === 2 ? "pl-5" : "pl-8"}
                ${isActive
                  ? "text-accent bg-accent-muted font-medium"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                }
              `}
            >
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
              )}
              <span className={`${isActive ? "" : "pl-3"} break-words min-w-0`}>{item.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const toc = useMemo(() => extractToc(content), [content]);

  useEffect(() => {
    if (toc.length === 0) return;

    function onScroll() {
      const headings = toc
        .map(({ id }) => ({ id, el: document.getElementById(id) }))
        .filter((h): h is { id: string; el: HTMLElement } => h.el !== null);

      let current = headings[0]?.id ?? "";
      for (const { id, el } of headings) {
        if (el.getBoundingClientRect().top <= 96) current = id;
      }
      setActiveId(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <>
      {/* Desktop TOC */}
      <nav className="hidden xl:block w-60 shrink-0">
        <div className="sticky top-20 rounded-xl border border-border-color bg-bg-secondary p-4">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineListBullet size={13} className="text-accent shrink-0" />
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              On this page
            </span>
          </div>
          <TocList toc={toc} activeId={activeId} onItemClick={(id) => setActiveId(id)} />
        </div>
      </nav>

      {/* Mobile TOC toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-hover transition-colors"
        aria-label="Open table of contents"
      >
        <HiOutlineListBullet size={20} />
      </button>

      {/* Mobile TOC drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 xl:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-bg-secondary border-t border-border-color rounded-t-2xl max-h-[60vh] overflow-y-auto animate-in">
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-bg-secondary border-b border-border-color">
              <div className="flex items-center gap-2">
                <HiOutlineListBullet size={14} className="text-accent" />
                <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest">
                  On this page
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>
            <div className="px-4 py-4">
              <TocList
                toc={toc}
                activeId={activeId}
                onItemClick={(id) => { setActiveId(id); setMobileOpen(false); }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
