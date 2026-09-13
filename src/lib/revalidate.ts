import { revalidatePath } from "next/cache";

/**
 * 글 하나가 바뀌면 그 글이 실리는 목록이 전부 낡는다.
 *
 * 목록은 한 덩어리가 아니라 페이지마다 따로 캐시되므로, /study 만 비우면
 * 2페이지 이후는 옛 내용을 그대로 보여준다. 글 수가 바뀌어 페이지 수까지
 * 달라진 경우에는 하단 페이지 버튼도 옛 개수로 남아, 4페이지에서는 6까지
 * 보이는데 5페이지로 넘어가면 5가 끝으로 보이는 식으로 어긋난다.
 *
 * 그래서 목록·카테고리·페이지네이션 경로를 함께 비운다.
 */
export function revalidatePost(opts: {
  blog: string;
  slug?: string | null;
  categorySlug?: string | null;
}) {
  const study = opts.blog === "study";
  const root = study ? "/study" : "/posts";
  const catRoot = study ? "/study/category" : "/category";

  revalidatePath("/");
  revalidatePath(root);
  revalidatePath(`${root}/page/[n]`, "page");

  if (opts.slug) revalidatePath(`${root}/${opts.slug}`);

  revalidatePath(`${catRoot}/[slug]`, "page");
  revalidatePath(`${catRoot}/[slug]/page/[n]`, "page");
}
