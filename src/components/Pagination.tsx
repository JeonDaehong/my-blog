"use client";

import Link from "next/link";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import type { PaginationMeta } from "@/lib/types";

/**
 * 목록 아래 페이지 버튼. 기술 블로그와 공부 블로그가 같은 모양을 쓰도록 따로 뺐다.
 * 주소 규칙만 hrefFor 로 받는다 — 두 블로그의 경로가 다르기 때문이다.
 *
 * 버튼이 아니라 Link 를 쓰는 이유가 있다. router.push 로 넘기면 다음 쪽을 미리
 * 받아두지 못해 매번 서버를 기다리고, 그 사이 loading.tsx 의 전체 화면 스피너가
 * 떠서 새로고침한 것처럼 보인다. Link 는 화면에 들어오는 순간 미리 받아둔다.
 * scroll={false} 는 페이지를 넘겨도 보던 위치에 그대로 있게 한다.
 */
const BOX = "flex items-center justify-center rounded-md border border-border-color transition-colors";

export default function Pagination({
  pagination,
  hrefFor,
}: {
  pagination: PaginationMeta;
  hrefFor: (page: number) => string;
}) {
  const { page, totalPages } = pagination;

  // 한 쪽밖에 없어도 숨기지 않는다. 지금 몇 번째 쪽을 보고 있는지는
  // 넘길 곳이 없을 때도 알려 줘야 목록이 끝났다는 게 드러난다.
  const arrow = (dir: "prev" | "next") => {
    const target = dir === "prev" ? page - 1 : page + 1;
    const disabled = dir === "prev" ? page <= 1 : page >= totalPages;
    const Icon = dir === "prev" ? HiChevronLeft : HiChevronRight;
    const label = dir === "prev" ? "이전 페이지" : "다음 페이지";

    if (disabled) {
      return (
        <span aria-hidden className={`${BOX} p-2 text-text-tertiary opacity-30`}>
          <Icon size={16} />
        </span>
      );
    }
    return (
      <Link
        href={hrefFor(target)}
        scroll={false}
        aria-label={label}
        className={`${BOX} p-2 text-text-tertiary hover:bg-bg-hover`}
      >
        <Icon size={16} />
      </Link>
    );
  };

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-2 mt-8">
      {arrow("prev")}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className="flex items-center justify-center w-8 h-8 rounded-md text-[13px] font-medium bg-accent text-white"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            scroll={false}
            className={`${BOX} w-8 h-8 text-[13px] font-medium text-text-tertiary hover:bg-bg-hover`}
          >
            {p}
          </Link>
        )
      )}

      {arrow("next")}
    </nav>
  );
}
