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

  const nameEn = body.nameEn || await translateToEnglish(body.name);
  const descriptionEn = body.descriptionEn || (body.description ? await translateToEnglish(body.description) : null);

  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: body.name,
      nameEn: nameEn || null,
      description: body.description || null,
      descriptionEn: descriptionEn || null,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
