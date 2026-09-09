import type { CardNewsPreview } from "@/lib/card-news";

export type CategoryBasic = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PostWithCategory = {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  content: string;
  contentEn: string | null;
  excerpt: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  published: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category: CategoryBasic | null;
};

export type PostSummary = Pick<
  PostWithCategory,
  | "id"
  | "title"
  | "titleEn"
  | "slug"
  | "excerpt"
  | "excerptEn"
  | "coverImage"
  | "published"
  | "createdAt"
  | "category"
>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedPosts = {
  posts: PostSummary[];
  pagination: PaginationMeta;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

/** 서버에서 미리 렌더한 본문. 원본 마크다운은 클라이언트로 보내지 않는다. */
export type RenderedMarkdown = {
  html: string;
  toc: TocItem[];
  readingTime: number;
};

/** 글 상세 화면이 쓰는 메타데이터. content/contentEn은 제외한다. */
export type PostDetail = {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  createdAt: string;
  category: CategoryBasic | null;
  hasContentEn: boolean;
};

export type PopularPost = {
  slug: string;
  title: string;
  titleEn: string | null;
  views: number;
};


export type CommentPreview = {
  id: string;
  author: string;
  avatar: string | null;
  body: string;
  createdAt: string;
  /** 댓글이 달린 사이트 내부 경로 */
  href: string;
  /** 경로 대신 보여줄 사람이 읽는 제목 */
  label: string;
};

/** /posts 좌측에 붙는 부가 섹션 데이터. 검색 중이거나 2페이지 이후에는 비운다. */
export type PostsExtras = {
  featured: PostSummary[];
  popular: PopularPost[];
  comments: CommentPreview[];
  cardNews: CardNewsPreview[];
};
