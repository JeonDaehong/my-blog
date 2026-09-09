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
