import type { CommentPreview } from "@/lib/types";

const REPO_OWNER = "JeonDaehong";
const REPO_NAME = "my-blog";

type GraphQLResponse = {
  data?: {
    repository?: {
      discussions?: {
        nodes?: Array<{
          title: string;
          url: string;
          comments?: {
            nodes?: Array<{
              id: string;
              body: string;
              url: string;
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
      discussions(first: 15, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          title
          url
          comments(last: 5) {
            nodes {
              id
              body
              url
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
 * 댓글은 Giscus(GitHub Discussions)에 있고, Discussions 조회는 GraphQL이라
 * 토큰이 필요하다. GITHUB_TOKEN이 없으면 조용히 빈 배열을 돌려주고,
 * 화면에서는 섹션 자체가 사라진다.
 */
export async function fetchRecentComments(limit = 3): Promise<CommentPreview[]> {
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

    const comments: CommentPreview[] = [];
    for (const discussion of json.data?.repository?.discussions?.nodes ?? []) {
      for (const comment of discussion.comments?.nodes ?? []) {
        comments.push({
          id: comment.id,
          author: comment.author?.login ?? "anonymous",
          avatar: comment.author?.avatarUrl ?? null,
          body: comment.body.replace(/\s+/g, " ").trim(),
          url: comment.url,
          createdAt: comment.createdAt,
          postTitle: discussion.title,
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
