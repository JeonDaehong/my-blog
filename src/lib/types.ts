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
