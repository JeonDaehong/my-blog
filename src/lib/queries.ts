import type { Prisma } from "@prisma/client";

const categoryBasicSelect = {
  id: true,
  name: true,
  nameEn: true,
  slug: true,
  description: true,
  descriptionEn: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

/**
 * 목록·카드 화면에 필요한 필드만. 본문(content/contentEn)은 한 편에 수만 자라
 * 목록에 실으면 응답이 30배 가까이 커지므로 반드시 제외한다.
 */
export const postCardSelect = {
  id: true,
  title: true,
  titleEn: true,
  slug: true,
  excerpt: true,
  excerptEn: true,
  coverImage: true,
  published: true,
  createdAt: true,
} satisfies Prisma.PostSelect;

export const postSummarySelect = {
  ...postCardSelect,
  category: { select: categoryBasicSelect },
} satisfies Prisma.PostSelect;
