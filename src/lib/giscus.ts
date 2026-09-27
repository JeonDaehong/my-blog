const REPO_OWNER = "JeonDaehong";
const REPO_NAME = "my-blog";

/** Giscus는 pathname 매핑이라 토론 제목이 곧 경로다. 제목 변환은 호출부에서 한다. */
export type RawComment = {
  id: string;
  author: string;
  avatar: string | null;
  body: string;
  createdAt: string;
  /** 토론 제목 = 댓글이 달린 페이지의 경로 (예: "posts/some-slug", "guestbook") */
  pathname: string;
};

type GraphQLResponse = {
  data?: {
    repository?: {
      discussions?: {
        nodes?: Array<{
          title: string;
          comments?: {
            nodes?: Array<{
              id: string;
              body: string;
              createdAt: string;
              author?: { login?: string; avatarUrl?: string } | null;
            }> | null;
          } | null;
        }> | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const QUERY = `
  query RecentComments($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 20, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          title
          comments(last: 5) {
            nodes {
              id
              body
              createdAt
              author { login avatarUrl }
            }
          }
        }
      }
    }
  }
`;

/**
 * 댓글은 Giscus(GitHub Discussions)에 있고, Discussions는 GraphQL로만 읽을 수
 * 있어 토큰이 필요하다. GITHUB_TOKEN이 없으면 조용히 빈 배열을 돌려주고
 * 화면에서는 섹션 자체가 사라진다.
 */
export async function fetchRecentComments(limit = 3): Promise<RawComment[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { owner: REPO_OWNER, name: REPO_NAME },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("[giscus] GitHub API 응답 오류:", res.status);
      return [];
    }

    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) {
      console.error("[giscus] GraphQL 오류:", json.errors[0].message);
      return [];
    }

    const comments: RawComment[] = [];
    for (const discussion of json.data?.repository?.discussions?.nodes ?? []) {
      for (const comment of discussion.comments?.nodes ?? []) {
        const body = comment.body.replace(/\s+/g, " ").trim();
        if (!body) continue;
        comments.push({
          id: comment.id,
          author: comment.author?.login ?? "anonymous",
          avatar: comment.author?.avatarUrl ?? null,
          body,
          createdAt: comment.createdAt,
          pathname: discussion.title.replace(/^\/+/, ""),
        });
      }
    }

    return comments
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);
  } catch (err) {
    console.error("[giscus] 댓글을 불러오지 못했습니다:", err);
    return [];
  }
}

const CATEGORY = "General";

const COUNT_QUERY = `
  query CommentCounts($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          title
          comments(first: 100) { totalCount nodes { replies { totalCount } } }
        }
      }
    }
  }
`;

type CountResponse = {
  data?: {
    repository?: {
      discussions?: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Array<{ title: string; comments: { totalCount: number; nodes: Array<{ replies: { totalCount: number } }> } }>;
      };
    };
  };
};

/** 토큰이 있으면 GraphQL 로 토론 전체를 한 번에 훑어 "경로 → 댓글+답글 수" 를 만든다. */
async function countsFromGraphQL(token: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  let after: string | null = null;
  for (let page = 0; page < 5; page++) {
    const res: Response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: COUNT_QUERY, variables: { owner: REPO_OWNER, name: REPO_NAME, after } }),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const json = (await res.json()) as CountResponse & { errors?: Array<{ message: string }> };
    if (json.errors?.length) throw new Error(`GraphQL ${json.errors[0].message}`);
    const discussions: NonNullable<NonNullable<CountResponse["data"]>["repository"]>["discussions"] =
      json.data?.repository?.discussions;
    for (const d of discussions?.nodes ?? []) {
      const replies = d.comments.nodes.reduce((sum, c) => sum + c.replies.totalCount, 0);
      counts.set(d.title.replace(/^\/+/, ""), d.comments.totalCount + replies);
    }
    if (!discussions?.pageInfo.hasNextPage) break;
    after = discussions.pageInfo.endCursor;
  }
  return counts;
}

/** 토큰이 없으면 giscus 위젯이 쓰는 공개 API 로 경로마다 묻는다. 토론이 없으면 404 = 댓글 0. */
async function countFromGiscus(term: string): Promise<number> {
  const url =
    `https://giscus.app/api/discussions?repo=${REPO_OWNER}/${REPO_NAME}` +
    `&term=${encodeURIComponent(term)}&category=${CATEGORY}&number=0&strict=false&last=1`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (res.status === 404) return 0;
  if (!res.ok) throw new Error(`giscus ${res.status}`);
  const json = (await res.json()) as { discussion?: { totalCommentCount?: number; totalReplyCount?: number } };
  return (json.discussion?.totalCommentCount ?? 0) + (json.discussion?.totalReplyCount ?? 0);
}

/**
 * 글 목록에 보여줄 댓글 수(댓글 + 답글). 키는 페이지 경로("/posts/slug").
 * 알아내지 못한 경로는 결과에서 빠지고, 화면에서는 그 글의 댓글 수만 표시되지 않는다.
 */
export async function fetchCommentCounts(
  paths: string[]
): Promise<{ counts: Record<string, number>; source: "graphql" | "giscus"; reason?: string }> {
  const result: Record<string, number> = {};
  const token = process.env.GITHUB_TOKEN;
  let reason = token ? undefined : "no-token";
  try {
    if (token) {
      const counts = await countsFromGraphQL(token);
      for (const path of paths) result[path] = counts.get(path.replace(/^\/+/, "")) ?? 0;
      return { counts: result, source: "graphql" };
    }
  } catch (err) {
    reason = err instanceof Error ? err.message : "graphql-error";
    console.error("[giscus] 댓글 수를 GraphQL 로 읽지 못해 공개 API 로 넘어갑니다:", err);
  }
  await Promise.all(
    paths.map(async (path) => {
      try {
        result[path] = await countFromGiscus(path.replace(/^\/+/, ""));
      } catch {
        /* 이 글만 건너뛴다 */
      }
    })
  );
  return { counts: result, source: "giscus", reason };
}
