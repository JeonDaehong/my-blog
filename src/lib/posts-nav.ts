/**
 * 목록 페이지 링크 규칙. 클라이언트 컴포넌트도 쓰기 때문에 DB를 건드리는
 * posts-page.ts와는 따로 둔다 — 함께 두면 prisma가 클라이언트 번들로 딸려온다.
 *
 * 1페이지는 정적으로 캐시되는 /posts, 그다음은 /posts/page/[n],
 * 검색은 매번 새로 질의해야 하므로 /search가 맡는다.
 */
export function postsPageHref(page: number, q?: string | null): string {
  if (q) {
    const params = new URLSearchParams({ q });
    if (page > 1) params.set("page", String(page));
    return `/search?${params}`;
  }
  return page > 1 ? `/posts/page/${page}` : "/posts";
}

/** 공부 블로그도 같은 규칙. 1페이지는 /study, 그다음은 /study/page/N */
export function studyPageHref(page: number): string {
  return page > 1 ? `/study/page/${page}` : "/study";
}

/** 카테고리 목록도 같은 규칙을 따른다. 1페이지는 /category/<slug>, 그다음은 그 아래 /page/N */
export function categoryPageHref(slug: string, page: number): string {
  const base = `/category/${encodeURIComponent(slug)}`;
  return page > 1 ? `${base}/page/${page}` : base;
}

/** 공부 블로그 카테고리. 상위 카테고리를 열면 하위 글까지 함께 센다. */
export function studyCategoryPageHref(slug: string, page: number): string {
  const base = `/study/category/${encodeURIComponent(slug)}`;
  return page > 1 ? `${base}/page/${page}` : base;
}
