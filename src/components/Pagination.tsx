"use client";

import { useRouter } from "next/navigation";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import type { PaginationMeta } from "@/lib/types";

/**
 * 목록 아래 페이지 버튼. 기술 블로그와 공부 블로그가 같은 모양을 쓰도록 따로 뺐다.
 * 주소 규칙만 hrefFor 로 받는다 — 두 블로그의 경로가 다르기 때문이다.
 */
export default function Pagination({
  pagination,
  hrefFor,
}: {
  pagination: PaginationMeta;
  hrefFor: (page: number) => string;
}) {
  const router = useRouter();
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const go = (p: number) => router.push(hrefFor(p));

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className="p-2 rounded-md border border-border-color text-text-tertiary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
            p === page
              ? "bg-accent text-white"
              : "border border-border-color text-text-tertiary hover:bg-bg-hover"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className="p-2 rounded-md border border-border-color text-text-tertiary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiChevronRight size={16} />
      </button>
    </div>
  );
}
