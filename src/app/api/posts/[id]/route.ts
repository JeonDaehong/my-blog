import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";

type Context = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Auto-translate if English fields are empty
  const titleEn = body.titleEn || await translateToEnglish(body.title);
  const contentEn = body.contentEn || await translateToEnglish(body.content);
  const excerptEn = body.excerptEn || (body.excerpt ? await translateToEnglish(body.excerpt) : null);

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,
      titleEn: titleEn || null,
      content: body.content,
      contentEn: contentEn || null,
      excerpt: body.excerpt || null,
      excerptEn: excerptEn || null,
      coverImage: body.coverImage || null,
      published: body.published,
      categoryId: body.categoryId || null,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
