import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";
import { generateSlug } from "@/lib/slug";

export async function GET(req: NextRequest) {
  // ?blog=study 면 공부 블로그 카테고리만
  const blog = req.nextUrl.searchParams.get("blog");
  const categories = await prisma.category.findMany({
    where: blog ? { blog } : {},
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    include: {
      _count: { select: { posts: true } },
      parent: { select: { name: true } },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "카테고리 이름은 필수입니다" }, { status: 400 });
  }

  const slug = body.slug || generateSlug(body.name, false);

  const nameEn = body.nameEn || (await translateToEnglish(body.name));
  const descriptionEn =
    body.descriptionEn ||
    (body.description ? await translateToEnglish(body.description) : null);

  const category = await prisma.category.create({
    data: {
      blog: body.blog === "study" ? "study" : "tech",
      name: body.name,
      nameEn: nameEn || null,
      slug,
      description: body.description || null,
      descriptionEn: descriptionEn || null,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
