"use client";

import { useEffect, useState } from "react";

/** 글 목록의 댓글 수(댓글 + 답글). 결과의 키는 slug. 조회수처럼 목록이 뜬 뒤에 채워진다. */
export function useCommentCounts(slugs: string[], base: "/posts" | "/study"): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const key = slugs.join(",");

  useEffect(() => {
    if (!key) return;
    const paths = key.split(",").map((slug) => `${base}/${slug}`);
    let cancelled = false;
    fetch(`/api/comments?paths=${encodeURIComponent(paths.join(","))}`)
      .then((r) => r.json())
      .then((byPath: Record<string, number>) => {
        if (cancelled) return;
        const bySlug: Record<string, number> = {};
        for (const [path, count] of Object.entries(byPath)) bySlug[path.slice(base.length + 1)] = count;
        setCounts(bySlug);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key, base]);

  return counts;
}
