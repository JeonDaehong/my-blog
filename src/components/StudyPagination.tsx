"use client";

import Pagination from "@/components/Pagination";
import { studyCategoryPageHref, studyPageHref } from "@/lib/posts-nav";
import type { PaginationMeta } from "@/lib/types";

/**
 * 서버 컴포넌트는 함수를 넘길 수 없으므로, 주소 규칙을 아는 얇은 클라이언트 껍데기를 둔다.
 * categorySlug 가 오면 그 카테고리 안에서 페이지를 넘긴다.
 */
export default function StudyPagination({
  pagination,
  categorySlug,
}: {
  pagination: PaginationMeta;
  categorySlug?: string;
}) {
  const hrefFor = categorySlug
    ? (p: number) => studyCategoryPageHref(categorySlug, p)
    : studyPageHref;
  return <Pagination pagination={pagination} hrefFor={hrefFor} />;
}
