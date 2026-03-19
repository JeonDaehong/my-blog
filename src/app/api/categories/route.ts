import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slug = body.slug || body.name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const nameEn = body.nameEn || await translateToEnglish(body.name);
  const descriptionEn = body.descriptionEn || (body.description ? await translateToEnglish(body.description) : null);

  const category = await prisma.category.create({
    data: {
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
