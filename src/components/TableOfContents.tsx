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
  onItemClick?: () => void;
}) {
  return (
    <ul className="space-y-1 border-l border-border-color">
      {toc.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(item.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                onItemClick?.();
              }
            }}
            className={`block text-[12px] leading-relaxed transition-colors ${
              item.level === 1 ? "pl-3" : item.level === 2 ? "pl-5" : "pl-7"
            } ${
              activeId === item.id
                ? "text-accent border-l-2 border-accent -ml-px"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const toc = useMemo(() => extractToc(content), [content]);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      toc.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <>
      {/* Desktop TOC */}
      <nav className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-20">
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-3">
            On this page
          </p>
          <TocList toc={toc} activeId={activeId} />
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
          <div className="fixed inset-0 bg-black/50 z-40 xl:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-bg-secondary border-t border-border-color rounded-t-2xl max-h-[60vh] overflow-y-auto animate-in">
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-bg-secondary border-b border-border-color">
              <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-widest">
                On this page
              </p>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-text-tertiary hover:text-text-primary">
                <HiOutlineXMark size={18} />
              </button>
            </div>
            <div className="px-5 py-4">
              <TocList toc={toc} activeId={activeId} onItemClick={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
