"use client";

import Pagination from "@/components/Pagination";
import { studyPageHref } from "@/lib/posts-nav";
import type { PaginationMeta } from "@/lib/types";

/** 서버 컴포넌트는 함수를 넘길 수 없으므로, 주소 규칙을 아는 얇은 클라이언트 껍데기를 둔다. */
export default function StudyPagination({ pagination }: { pagination: PaginationMeta }) {
  return <Pagination pagination={pagination} hrefFor={studyPageHref} />;
}
