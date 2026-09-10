"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineListBullet, HiOutlineXMark, HiChevronRight } from "react-icons/hi2";
import type { TocItem } from "@/lib/types";

/** 상위 제목(h1·h2) 하나와 그 아래 붙는 h3들. */
type TocGroup = { item: TocItem; children: TocItem[] };

/**
 * 긴 글은 제목이 스무 개를 넘어가 목록이 화면보다 길어졌다. h3는 접어 두고
 * 지금 읽는 섹션의 것만 펼쳐 목록 길이를 상위 제목 수 근처로 묶어 둔다.
 */
function group(toc: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const item of toc) {
    const parent = groups[groups.length - 1];
    // 앞에 상위 제목이 없는 h3는 접을 곳이 없으니 그대로 한 줄을 차지한다.
    if (item.level <= 2 || !parent) groups.push({ item, children: [] });
    else parent.children.push(item);
  }
  return groups;
}

function TocLink({
  item,
  isActive,
  onItemClick,
  trailing,
}: {
  item: TocItem;
  isActive: boolean;
  onItemClick?: (id: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
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
      {isActive && <span className="w-1 h-1 rounded-full bg-accent shrink-0" />}
      <span className={`${isActive ? "" : "pl-3"} break-words min-w-0 flex-1`}>
        {item.text}
      </span>
      {trailing}
    </a>
  );
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
  const groups = useMemo(() => group(toc), [toc]);

  return (
    <ul className="space-y-0.5">
      {groups.map(({ item, children }) => {
        const open =
          item.id === activeId || children.some((child) => child.id === activeId);
        return (
          <li key={item.id}>
            <TocLink
              item={item}
              isActive={item.id === activeId}
              onItemClick={onItemClick}
              trailing={
                children.length > 0 ? (
                  <HiChevronRight
                    size={12}
                    aria-hidden
                    className={`shrink-0 transition-transform duration-150 ${
                      open ? "rotate-90" : ""
                    }`}
                  />
                ) : null
              }
            />
            {open && children.length > 0 && (
              <ul className="space-y-0.5">
                {children.map((child) => (
                  <li key={child.id}>
                    <TocLink
                      item={child}
                      isActive={child.id === activeId}
                      onItemClick={onItemClick}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function TableOfContents({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* 접어도 넘칠 만큼 긴 글이 있으므로 화면 높이를 넘기면 목록 안에서 스크롤한다 */}
      <nav className="hidden xl:block w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border-color bg-bg-secondary p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineListBullet size={13} className="text-accent shrink-0" />
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
            On this page
          </span>
        </div>
        <TocList toc={toc} activeId={activeId} onItemClick={(id) => setActiveId(id)} />
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
